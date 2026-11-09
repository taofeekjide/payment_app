import { randomUUID } from "node:crypto";
import { pool } from "../db.js";

type TransferInput = {
  senderUserId: string;
  recipientEmail: string;
  amountKobo: string;
  idempotencyKey: string;
};

type TransferResult = {
  id: string;
  reference: string;
  amountKobo: string;
  status: string;
  recipient: {
    fullName: string;
    email: string;
  };
  createdAt: Date;
  reused?: boolean;
};

export class TransferError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "TransferError";
  }
}

function validateAmount(amountKobo: string): bigint {
  if (!/^[0-9]+$/.test(amountKobo)) {
    throw new TransferError("Invalid transfer amount.", 400);
  }

  const amount = BigInt(amountKobo);
  const maxBigInt = 9223372036854775807n;

  if (amount <= 0n || amount > maxBigInt) {
    throw new TransferError("Invalid transfer amount.", 400);
  }

  return amount;
}

async function findExistingTransfer(
  senderUserId: string,
  idempotencyKey: string,
): Promise<TransferResult | null> {
  const result = await pool.query(
    `SELECT
        t.id,
        t.reference,
        t.amount_kobo,
        t.status,
        t.created_at,
        u.full_name AS recipient_name,
        u.email AS recipient_email
     FROM ledger_transactions t
     JOIN wallets w ON w.id = t.destination_wallet_id
     JOIN users u ON u.id = w.user_id
     WHERE t.initiated_by_user_id = $1
       AND t.idempotency_key = $2
     LIMIT 1`,
    [senderUserId, idempotencyKey],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  return {
    id: row.id,
    reference: row.reference,
    amountKobo: row.amount_kobo,
    status: row.status,
    recipient: {
      fullName: row.recipient_name,
      email: row.recipient_email,
    },
    createdAt: row.created_at,
    reused: true,
  };
}

export async function transferFunds(
  input: TransferInput,
): Promise<TransferResult> {
  const { senderUserId, recipientEmail, amountKobo, idempotencyKey } = input;

  const amount = validateAmount(amountKobo);
  const email = recipientEmail.trim().toLowerCase();

  if (!email || email.length > 254) {
    throw new TransferError("Enter a valid recipient email.", 400);
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idempotencyKey,
    )
  ) {
    throw new TransferError("Invalid transfer request key.", 400);
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Return the original result if this request was already processed.
    const existing = await client.query(
      `SELECT
          t.id,
          t.reference,
          t.amount_kobo,
          t.status,
          t.created_at,
          t.destination_wallet_id,
          u.full_name AS recipient_name,
          u.email AS recipient_email
       FROM ledger_transactions t
       JOIN wallets w ON w.id = t.destination_wallet_id
       JOIN users u ON u.id = w.user_id
       WHERE t.initiated_by_user_id = $1
         AND t.idempotency_key = $2
       LIMIT 1`,
      [senderUserId, idempotencyKey],
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];

      if (
        BigInt(row.amount_kobo) !== amount ||
        row.recipient_email.toLowerCase() !== email
      ) {
        throw new TransferError(
          "This request key has already been used for a different transfer.",
          409,
        );
      }

      await client.query("COMMIT");
      transactionStarted = false;

      return {
        id: row.id,
        reference: row.reference,
        amountKobo: row.amount_kobo,
        status: row.status,
        recipient: {
          fullName: row.recipient_name,
          email: row.recipient_email,
        },
        createdAt: row.created_at,
        reused: true,
      };
    }

    // Find an active recipient account.
    const recipientResult = await client.query(
      `SELECT id, full_name, email
       FROM users
       WHERE LOWER(email) = $1
         AND status = 'active'
       LIMIT 1`,
      [email],
    );

    if (recipientResult.rows.length === 0) {
      throw new TransferError("Recipient account not found.", 404);
    }

    const recipientUser = recipientResult.rows[0];

    if (recipientUser.id === senderUserId) {
      throw new TransferError("You cannot transfer money to yourself.", 400);
    }

    // Lock both wallets in a consistent order to reduce deadlocks.
    const walletResult = await client.query(
      `SELECT
          id,
          user_id,
          ledger_account_id,
          balance_kobo,
          status
       FROM wallets
       WHERE user_id = ANY($1::uuid[])
       ORDER BY user_id
       FOR UPDATE`,
      [[senderUserId, recipientUser.id]],
    );

    const senderWallet = walletResult.rows.find(
      (wallet) => wallet.user_id === senderUserId,
    );

    const recipientWallet = walletResult.rows.find(
      (wallet) => wallet.user_id === recipientUser.id,
    );

    if (!senderWallet || !recipientWallet) {
      throw new TransferError("A wallet could not be found.", 404);
    }

    if (
      senderWallet.status !== "active" ||
      recipientWallet.status !== "active"
    ) {
      throw new TransferError(
        "One of the wallets is not available for transfers.",
        403,
      );
    }

    if (BigInt(senderWallet.balance_kobo) < amount) {
      throw new TransferError("Insufficient wallet balance.", 400);
    }

    const reference = `TRF-${randomUUID()}`;

    // Record the transfer.
    const transactionResult = await client.query(
      `INSERT INTO ledger_transactions (
          reference,
          transaction_type,
          status,
          initiated_by_user_id,
          description,
          source_wallet_id,
          destination_wallet_id,
          amount_kobo,
          idempotency_key
       )
       VALUES ($1, 'transfer', 'posted', $2, $3, $4, $5, $6, $7)
       RETURNING id, reference, amount_kobo, status, created_at`,
      [
        reference,
        senderUserId,
        `Transfer to ${recipientUser.full_name}`,
        senderWallet.id,
        recipientWallet.id,
        amount.toString(),
        idempotencyKey,
      ],
    );

    const transaction = transactionResult.rows[0];

    // Debit sender's ledger account.
    await client.query(
      `INSERT INTO ledger_entries (
          transaction_id,
          ledger_account_id,
          entry_type,
          amount_kobo
       )
       VALUES ($1, $2, 'debit', $3)`,
      [transaction.id, senderWallet.ledger_account_id, amount.toString()],
    );

    // Credit recipient's ledger account.
    await client.query(
      `INSERT INTO ledger_entries (
          transaction_id,
          ledger_account_id,
          entry_type,
          amount_kobo
       )
       VALUES ($1, $2, 'credit', $3)`,
      [transaction.id, recipientWallet.ledger_account_id, amount.toString()],
    );

    // Update both cached wallet balances.
    await client.query(
      `UPDATE wallets
       SET balance_kobo = balance_kobo - $1::bigint,
           updated_at = NOW()
       WHERE id = $2`,
      [amount.toString(), senderWallet.id],
    );

    await client.query(
      `UPDATE wallets
       SET balance_kobo = balance_kobo + $1::bigint,
           updated_at = NOW()
       WHERE id = $2`,
      [amount.toString(), recipientWallet.id],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      id: transaction.id,
      reference: transaction.reference,
      amountKobo: transaction.amount_kobo,
      status: transaction.status,
      recipient: {
        fullName: recipientUser.full_name,
        email: recipientUser.email,
      },
      createdAt: transaction.created_at,
    };
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
      transactionStarted = false;
    }

    // A concurrent retry may have inserted the same request first.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      const existing = await findExistingTransfer(senderUserId, idempotencyKey);

      if (existing) {
        if (
          BigInt(existing.amountKobo) !== amount ||
          existing.recipient.email.toLowerCase() !== email
        ) {
          throw new TransferError(
            "This request key has already been used for a different transfer.",
            409,
          );
        }

        return existing;
      }
    }

    throw error;
  } finally {
    client.release();
  }
}
