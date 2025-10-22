import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDatabaseBackupsTableClean1760871200000 implements MigrationInterface {
    name = 'CreateDatabaseBackupsTableClean1760871200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for backup status and type
        await queryRunner.query(`
            CREATE TYPE "public"."database_backups_status_enum" AS ENUM(
                'PENDING', 
                'IN_PROGRESS', 
                'COMPLETED', 
                'FAILED', 
                'DELETED'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."database_backups_type_enum" AS ENUM(
                'MANUAL', 
                'SCHEDULED_DAILY', 
                'SCHEDULED_WEEKLY', 
                'SCHEDULED_MONTHLY'
            )
        `);
        
        // Create database_backups table
        await queryRunner.query(`
            CREATE TABLE "database_backups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fileName" character varying NOT NULL,
                "s3Key" character varying NOT NULL,
                "s3Url" character varying NOT NULL,
                "fileSize" bigint NOT NULL,
                "status" "public"."database_backups_status_enum" NOT NULL DEFAULT 'PENDING',
                "type" "public"."database_backups_type_enum" NOT NULL DEFAULT 'MANUAL',
                "databaseName" character varying,
                "databaseSize" character varying,
                "executionTime" integer,
                "errorMessage" text,
                "createdBy" uuid,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_453a5e5f858d08f4fde91d0640c" PRIMARY KEY ("id")
            )
        `);

        // Create index on createdAt for faster queries
        await queryRunner.query(`
            CREATE INDEX "IDX_database_backups_created_at" ON "database_backups" ("createdAt")
        `);

        // Create index on status for filtering
        await queryRunner.query(`
            CREATE INDEX "IDX_database_backups_status" ON "database_backups" ("status")
        `);

        // Create index on type for filtering
        await queryRunner.query(`
            CREATE INDEX "IDX_database_backups_type" ON "database_backups" ("type")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_database_backups_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_database_backups_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_database_backups_created_at"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "database_backups"`);
        
        // Drop enums
        await queryRunner.query(`DROP TYPE "public"."database_backups_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."database_backups_status_enum"`);
    }
}
