
BEGIN;

CREATE TABLE IF NOT EXISTS ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    account_type VARCHAR(20) NOT NULL
        CHECK (account_type IN ('wallet', 'platform')),

    user_id UUID UNIQUE REFERENCES users(id),

    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_ledger_account_owner CHECK (
        (account_type = 'wallet' AND user_id IS NOT NULL)
        OR
        (account_type = 'platform' AND user_id IS NULL)
    )
);


CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE REFERENCES users(id),

    ledger_account_id UUID NOT NULL UNIQUE
        REFERENCES ledger_accounts(id),

    balance_kobo BIGINT NOT NULL DEFAULT 0
        CHECK (balance_kobo >= 0),

    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'frozen', 'closed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reference VARCHAR(80) NOT NULL UNIQUE,

    transaction_type VARCHAR(30) NOT NULL
        CHECK (
            transaction_type IN (
                'transfer',
                'funding',
                'withdrawal',
                'reversal'
            )
        ),

    status VARCHAR(20) NOT NULL DEFAULT 'posted'
        CHECK (status IN ('posted', 'reversed')),

    initiated_by_user_id UUID REFERENCES users(id),

    description VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID NOT NULL
        REFERENCES ledger_transactions(id),

    ledger_account_id UUID NOT NULL
        REFERENCES ledger_accounts(id),

    entry_type VARCHAR(10) NOT NULL
        CHECK (entry_type IN ('debit', 'credit')),

    amount_kobo BIGINT NOT NULL
        CHECK (amount_kobo > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id
    ON wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_ledger_transactions_created_at
    ON ledger_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id
    ON ledger_entries(transaction_id);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_account_id
    ON ledger_entries(ledger_account_id);


INSERT INTO ledger_accounts (account_type, currency)
SELECT 'platform', 'NGN'
WHERE NOT EXISTS (
    SELECT 1
    FROM ledger_accounts
    WHERE account_type = 'platform'
      AND currency = 'NGN'
);


CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
DECLARE
    new_account_id UUID;
BEGIN
    INSERT INTO ledger_accounts (account_type, user_id, currency)
    VALUES ('wallet', NEW.id, 'NGN')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO new_account_id;

    IF new_account_id IS NOT NULL THEN
        INSERT INTO wallets (user_id, ledger_account_id)
        VALUES (NEW.id, new_account_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_wallet ON users;

CREATE TRIGGER trg_create_user_wallet
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_wallet();


DO $$
DECLARE
    existing_user RECORD;
    new_account_id UUID;
BEGIN
    FOR existing_user IN
        SELECT id FROM users
    LOOP
        INSERT INTO ledger_accounts (account_type, user_id, currency)
        VALUES ('wallet', existing_user.id, 'NGN')
        ON CONFLICT (user_id) DO NOTHING
        RETURNING id INTO new_account_id;

        IF new_account_id IS NOT NULL THEN
            INSERT INTO wallets (user_id, ledger_account_id)
            VALUES (existing_user.id, new_account_id)
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END LOOP;
END;
$$;

COMMIT;
