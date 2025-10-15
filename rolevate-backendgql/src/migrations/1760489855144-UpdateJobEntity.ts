import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJobEntity1760489855144 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check existing columns
        const existingColumns = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'job'
        `);
        const columnNames = existingColumns.map((row: any) => row.column_name);

        // Add new columns only if they don't exist
        if (!columnNames.includes('department')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "department" character varying NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('type')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "type" character varying NOT NULL DEFAULT 'FULL_TIME'
            `);
        }

        if (!columnNames.includes('deadline')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "deadline" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            `);
        }

        if (!columnNames.includes('shortDescription')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "shortDescription" text NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('responsibilities')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "responsibilities" text NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('requirements')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "requirements" text NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('benefits')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "benefits" text NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('skills')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "skills" text NOT NULL DEFAULT '{}'
            `);
        }

        if (!columnNames.includes('experience')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "experience" character varying NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('education')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "education" character varying NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('jobLevel')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "jobLevel" character varying NOT NULL DEFAULT 'ENTRY'
            `);
        }

        if (!columnNames.includes('workType')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "workType" character varying NOT NULL DEFAULT 'ONSITE'
            `);
        }

        if (!columnNames.includes('industry')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "industry" character varying NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('companyDescription')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "companyDescription" text NOT NULL DEFAULT ''
            `);
        }

        if (!columnNames.includes('status')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "status" character varying NOT NULL DEFAULT 'DRAFT'
            `);
        }

        if (!columnNames.includes('cvAnalysisPrompt')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "cvAnalysisPrompt" text
            `);
        }

        if (!columnNames.includes('interviewPrompt')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "interviewPrompt" text
            `);
        }

        if (!columnNames.includes('aiSecondInterviewPrompt')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "aiSecondInterviewPrompt" text
            `);
        }

        if (!columnNames.includes('interviewLanguage')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "interviewLanguage" character varying NOT NULL DEFAULT 'english'
            `);
        }

        if (!columnNames.includes('featured')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "featured" boolean NOT NULL DEFAULT false
            `);
        }

        if (!columnNames.includes('applicants')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "applicants" integer NOT NULL DEFAULT 0
            `);
        }

        if (!columnNames.includes('views')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "views" integer NOT NULL DEFAULT 0
            `);
        }

        if (!columnNames.includes('updatedAt')) {
            await queryRunner.query(`
                ALTER TABLE "job"
                ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            `);
        }

        // Update existing salary column to be text instead of decimal
        await queryRunner.query(`
            ALTER TABLE "job"
            ALTER COLUMN "salary" TYPE character varying
        `);

        // Set default values for required fields on existing records
        await queryRunner.query(`
            UPDATE "job"
            SET
                "department" = COALESCE("company", ''),
                "shortDescription" = COALESCE("description", ''),
                "responsibilities" = '',
                "requirements" = '',
                "benefits" = '',
                "experience" = '',
                "education" = '',
                "industry" = '',
                "companyDescription" = COALESCE("company", '')
            WHERE "department" = ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove new columns from Job table
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "views"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "applicants"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "featured"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "interviewLanguage"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "aiSecondInterviewPrompt"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "interviewPrompt"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "cvAnalysisPrompt"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "companyDescription"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "industry"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "workType"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "jobLevel"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "education"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "experience"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "skills"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "benefits"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "requirements"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "responsibilities"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "shortDescription"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "deadline"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "department"`);

        // Revert salary column back to decimal
        await queryRunner.query(`
            ALTER TABLE "job"
            ALTER COLUMN "salary" TYPE numeric(10,2)
        `);
    }

}