import AppDataSource from './src/data-source';

async function checkSchema() {
  await AppDataSource.initialize();
  
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    const result = await queryRunner.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'company' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Company table columns:');
    console.table(result);
    
    const hasEmail = result.some((col: any) => col.column_name === 'email');
    const hasPhone = result.some((col: any) => col.column_name === 'phone');
    
    console.log('\nEmail column exists:', hasEmail);
    console.log('Phone column exists:', hasPhone);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

checkSchema();
