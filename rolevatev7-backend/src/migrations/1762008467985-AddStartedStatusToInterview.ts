import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartedStatusToInterview1762008467985 implements MigrationInterface {
    name = 'AddStartedStatusToInterview1762008467985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TYPE "public"."interview_status_enum" RENAME TO "interview_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."interview_status_enum" AS ENUM('SCHEDULED', 'STARTED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')`);
        await queryRunner.query(`ALTER TABLE "interview" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "interview" ALTER COLUMN "status" TYPE "public"."interview_status_enum" USING "status"::"text"::"public"."interview_status_enum"`);
        await queryRunner.query(`ALTER TABLE "interview" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'`);
        await queryRunner.query(`DROP TYPE "public"."interview_status_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("userId", "jobId") `);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`CREATE TYPE "public"."interview_status_enum_old" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')`);
        await queryRunner.query(`ALTER TABLE "interview" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "interview" ALTER COLUMN "status" TYPE "public"."interview_status_enum_old" USING "status"::"text"::"public"."interview_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "interview" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'`);
        await queryRunner.query(`DROP TYPE "public"."interview_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."interview_status_enum_old" RENAME TO "interview_status_enum"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("jobId", "userId") `);
    }

}
