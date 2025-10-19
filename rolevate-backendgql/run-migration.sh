#!/bin/bash

# Run this script to add the ANALYZED status to the database
# Usage: ./run-migration.sh

echo "🔄 Adding ANALYZED status to application_status_enum..."

PGPASSWORD=tt55oo77 psql -h 149.200.251.12 -U husain -d rolegrow -p 5432 << EOF
ALTER TYPE application_status_enum ADD VALUE IF NOT EXISTS 'ANALYZED';
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'application_status_enum'::regtype ORDER BY enumsortorder;
EOF

echo "✅ Migration completed!"
