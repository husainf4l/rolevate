import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnalyzedStatusToApplicationStatusEnum1729294800000 implements MigrationInterface {
    name = 'AddAnalyzedStatusToApplicationStatusEnum1729294800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add ANALYZED to application_status_enum
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_enum 
                    WHERE enumlabel = 'ANALYZED' 
                    AND enumtypid = 'application_status_enum'::regtype
                ) THEN
                    ALTER TYPE application_status_enum ADD VALUE 'ANALYZED';
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing enum values easily
        // You would need to recreate the enum type to remove a value
        console.log('Cannot automatically remove enum value. Manual intervention required.');
    }
}
