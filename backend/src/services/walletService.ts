import { pool } from "../db.js";

export type Wallet = {
  id: string;
  userId: string;
  balanceKobo: string;
  currency: string;
  status: "active" | "frozen" | "closed";
  createdAt: Date;
};

export async function getWalletByUserId(
  userId: string,
): Promise<Wallet | null> {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        balance_kobo,
        currency,
        status,
        created_at
      FROM wallets
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    userId: row.user_id,
    balanceKobo: row.balance_kobo,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
  };
}
