
BEGIN;

ALTER TABLE ledger_transactions
    ADD COLUMN source_wallet_id UUID REFERENCES wallets(id),
    ADD COLUMN destination_wallet_id UUID REFERENCES wallets(id),
    ADD COLUMN amount_kobo BIGINT;

ALTER TABLE ledger_transactions
    ADD COLUMN idempotency_key VARCHAR(100);

ALTER TABLE ledger_transactions
    ADD CONSTRAINT ledger_transactions_transfer_fields_check
    CHECK (
        transaction_type <> 'transfer'
        OR (
            source_wallet_id IS NOT NULL
            AND destination_wallet_id IS NOT NULL
            AND amount_kobo IS NOT NULL
            AND amount_kobo > 0
            AND idempotency_key IS NOT NULL
            AND source_wallet_id <> destination_wallet_id
        )
    );

CREATE UNIQUE INDEX ledger_transactions_idempotency_idx
    ON ledger_transactions (initiated_by_user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX ledger_transactions_source_wallet_idx
    ON ledger_transactions (source_wallet_id);

CREATE INDEX ledger_transactions_destination_wallet_idx
    ON ledger_transactions (destination_wallet_id);

COMMIT;
