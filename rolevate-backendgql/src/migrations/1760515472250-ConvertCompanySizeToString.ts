import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertCompanySizeToString1760515472250 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Convert the size column from enum to varchar
        await queryRunner.query(`
            ALTER TABLE "company" 
            ALTER COLUMN "size" TYPE character varying 
            USING size::text
        `);
        
        // Drop the enum type if it exists
        await queryRunner.query(`
            DROP TYPE IF EXISTS "company_size_enum"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the enum type
        await queryRunner.query(`
            CREATE TYPE "company_size_enum" AS ENUM('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE')
        `);
        
        // Convert back to enum (this will fail if there are values that don't match the enum)
        await queryRunner.query(`
            ALTER TABLE "company" 
            ALTER COLUMN "size" TYPE "company_size_enum" 
            USING size::"company_size_enum"
        `);
    }

}
