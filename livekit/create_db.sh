#!/bin/bash

# This script creates the PostgreSQL database needed for the application
# It needs to be run with sudo privileges

echo "Creating PostgreSQL database 'rolevate'..."

# Using the postgres user to create the database and grant privileges
sudo -u postgres psql -c "CREATE DATABASE rolevate;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rolevate TO husain;"

echo "Setting up initial table structure..."
sudo -u postgres psql -d rolevate -c "
    CREATE TABLE IF NOT EXISTS interview_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64),
        question TEXT,
        answer TEXT,
        language VARCHAR(8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    GRANT ALL PRIVILEGES ON TABLE interview_history TO husain;
    GRANT USAGE, SELECT ON SEQUENCE interview_history_id_seq TO husain;
"

echo "Database setup complete!"
