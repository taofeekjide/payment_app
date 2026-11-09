
BEGIN;

CREATE OR REPLACE FUNCTION validate_ledger_transaction()
RETURNS TRIGGER AS $$
DECLARE
    target_transaction_id UUID;
    debit_total NUMERIC;
    credit_total NUMERIC;
    entry_count BIGINT;
BEGIN
    IF TG_TABLE_NAME = 'ledger_transactions' THEN
        target_transaction_id := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        target_transaction_id := OLD.transaction_id;
    ELSE
        target_transaction_id := NEW.transaction_id;
    END IF;

    SELECT
        COUNT(*),
        COALESCE(SUM(amount_kobo) FILTER (
            WHERE entry_type = 'debit'
        ), 0),
        COALESCE(SUM(amount_kobo) FILTER (
            WHERE entry_type = 'credit'
        ), 0)
    INTO entry_count, debit_total, credit_total
    FROM ledger_entries
    WHERE transaction_id = target_transaction_id;

    IF entry_count < 2 OR debit_total <> credit_total THEN
        RAISE EXCEPTION
            'Ledger transaction % is incomplete or unbalanced',
            target_transaction_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_ledger_transaction
ON ledger_transactions;

CREATE CONSTRAINT TRIGGER trg_validate_ledger_transaction
AFTER INSERT ON ledger_transactions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_ledger_transaction();

DROP TRIGGER IF EXISTS trg_validate_ledger_entries
ON ledger_entries;

CREATE CONSTRAINT TRIGGER trg_validate_ledger_entries
AFTER INSERT OR UPDATE OR DELETE ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_ledger_transaction();


CREATE OR REPLACE FUNCTION prevent_ledger_entry_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'Ledger entries cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_ledger_entry_mutation
ON ledger_entries;

CREATE TRIGGER trg_prevent_ledger_entry_mutation
BEFORE UPDATE OR DELETE ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_entry_mutation();

COMMIT;
