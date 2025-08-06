-- -- Update deleted_records table
-- ALTER TABLE deleted_records
-- ADD COLUMN deleted_by VARCHAR(255),
-- ADD COLUMN deleted_by_email VARCHAR(255);

-- -- Update transaction_logs table
-- ALTER TABLE transaction_logs
-- ADD COLUMN performed_by VARCHAR(255),
-- ADD COLUMN performed_by_email VARCHAR(255);

-- -- Create indexes for better performance
-- CREATE INDEX idx_deleted_records_deleted_by ON deleted_records(deleted_by);
-- CREATE INDEX idx_deleted_records_deleted_by_email ON deleted_records(deleted_by_email);
-- CREATE INDEX idx_transaction_logs_performed_by ON transaction_logs(performed_by);
-- CREATE INDEX idx_transaction_logs_performed_by_email ON transaction_logs(performed_by_email);

-- -- Add comments to columns
-- COMMENT ON COLUMN deleted_records.deleted_by IS 'Name of the admin who deleted the record';
-- COMMENT ON COLUMN deleted_records.deleted_by_email IS 'Email of the admin who deleted the record';

-- COMMENT ON COLUMN transaction_logs.performed_by IS 'Name of the admin who performed the action';
-- COMMENT ON COLUMN transaction_logs.performed_by_email IS 'Email of the admin who performed the action'; 