import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1760489894291 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename role column to userType
        await queryRunner.query(`
            ALTER TABLE "user"
            RENAME COLUMN "role" TO "userType"
        `);

        // Update the enum values (CANDIDATE/BUSINESS -> SYSTEM/COMPANY/CANDIDATE/ADMIN)
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "userType" TYPE character varying
        `);

        // Update existing enum values
        await queryRunner.query(`
            UPDATE "user"
            SET "userType" = CASE
                WHEN "userType" = 'CANDIDATE' THEN 'CANDIDATE'
                WHEN "userType" = 'BUSINESS' THEN 'COMPANY'
                ELSE 'CANDIDATE'
            END
        `);

        // Add new columns
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "phone" character varying
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "avatar" character varying
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "companyId" character varying
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        // Make password nullable
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "password" DROP NOT NULL
        `);

        // Make email nullable
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "email" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove new columns
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);

        // Make password and email required again
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "password" SET NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "email" SET NOT NULL
        `);

        // Revert userType back to role with old enum values
        await queryRunner.query(`
            UPDATE "user"
            SET "userType" = CASE
                WHEN "userType" = 'CANDIDATE' THEN 'CANDIDATE'
                WHEN "userType" = 'COMPANY' THEN 'BUSINESS'
                WHEN "userType" = 'SYSTEM' THEN 'CANDIDATE'
                WHEN "userType" = 'ADMIN' THEN 'CANDIDATE'
                ELSE 'CANDIDATE'
            END
        `);

        // Rename userType back to role
        await queryRunner.query(`
            ALTER TABLE "user"
            RENAME COLUMN "userType" TO "role"
        `);
    }

}