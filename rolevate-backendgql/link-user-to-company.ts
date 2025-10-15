import { DataSource } from 'typeorm';
import dataSource from './src/data-source';

async function linkUserToCompany() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    const companyId = '1d277844-ca8e-4cf0-be10-5aa48aeb26d2';
    const userId = 'pw93ndf6hh4wmiitpystwg8q'; // al-hussein@papayatrading.com
    
    // Update the user to link to the company
    await dataSource.query(`
      UPDATE "user" 
      SET "companyId" = $1 
      WHERE id = $2
    `, [companyId, userId]);
    
    console.log('✓ User linked to company');
    
    // Verify the link
    const user = await dataSource.query(`
      SELECT id, name, email, "userType", "companyId" 
      FROM "user" 
      WHERE id = $1
    `, [userId]);
    
    console.log('\nUpdated user:');
    console.table(user);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

linkUserToCompany();
