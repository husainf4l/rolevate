import { DataSource } from 'typeorm';
import dataSource from './src/data-source';

async function checkCompanyUsers() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    const companyId = '1d277844-ca8e-4cf0-be10-5aa48aeb26d2';
    
    // Check users with this companyId
    const users = await dataSource.query(`
      SELECT id, name, email, "userType", "companyId" 
      FROM "user" 
      WHERE "companyId" = $1
    `, [companyId]);
    
    console.log('\nUsers for company:', companyId);
    console.log('Found', users.length, 'users:');
    console.table(users);
    
    // Also check all users to see their companyId values
    const allUsers = await dataSource.query(`
      SELECT id, name, email, "userType", "companyId" 
      FROM "user"
      LIMIT 10
    `);
    
    console.log('\nAll users (first 10):');
    console.table(allUsers);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

checkCompanyUsers();
