import { Client } from 'pg';

async function resetDatabase() {
  const client = new Client({
    host: '149.200.251.12',
    port: 5432,
    user: 'husain',
    password: 'tt55oo77',
    database: 'rolegrow',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Drop all tables
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('Dropped users table');

    await client.query('DROP TABLE IF EXISTS companies CASCADE;');
    console.log('Dropped companies table');

    await client.query('DROP TABLE IF EXISTS jobs CASCADE;');
    console.log('Dropped jobs table');

    await client.query('DROP TABLE IF EXISTS candidate_profiles CASCADE;');
    console.log('Dropped candidate_profiles table');

    await client.query('DROP TABLE IF EXISTS applications CASCADE;');
    console.log('Dropped applications table');

    // Drop enums
    await client.query('DROP TYPE IF EXISTS jobs_jobtype_enum CASCADE;');
    await client.query('DROP TYPE IF EXISTS jobs_experiencelevel_enum CASCADE;');
    await client.query('DROP TYPE IF EXISTS applications_status_enum CASCADE;');
    await client.query('DROP TYPE IF EXISTS user_role_enum CASCADE;');
    console.log('Dropped all enums');

    console.log('\n✅ Database reset complete! Restart your services to recreate tables.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();
