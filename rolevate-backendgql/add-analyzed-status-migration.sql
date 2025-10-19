-- Add ANALYZED to application_status_enum
-- Run this SQL in your PostgreSQL database

ALTER TYPE application_status_enum ADD VALUE IF NOT EXISTS 'ANALYZED';

-- Verify the change
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'application_status_enum'::regtype ORDER BY enumsortorder;
