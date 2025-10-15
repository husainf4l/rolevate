import { DataSource } from 'typeorm';
import dataSource from './src/data-source';

async function fixCompanySizeColumn() {
  
  try {
    await dataSource.initialize();
    console.log('Connected to database');
    
    // Convert the size column from enum to varchar
    await dataSource.query(`
      ALTER TABLE "company" 
      ALTER COLUMN "size" TYPE character varying 
      USING size::text
    `);
    console.log('✓ Converted size column to varchar');
    
    // Drop the enum type
    await dataSource.query(`
      DROP TYPE IF EXISTS "company_size_enum"
    `);
    console.log('✓ Dropped company_size_enum type');
    
    console.log('\nSuccess! The company size column is now varchar and accepts any string value.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

fixCompanySizeColumn();
