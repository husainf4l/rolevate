import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Drop all tables in the public schema
    await client.query('DROP SCHEMA public CASCADE');
    console.log('Dropped public schema');

    // Recreate the public schema
    await client.query('CREATE SCHEMA public');
    console.log('Recreated public schema');

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();