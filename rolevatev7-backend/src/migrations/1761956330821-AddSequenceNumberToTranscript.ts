import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSequenceNumberToTranscript1761956330821 implements MigrationInterface {
    name = 'AddSequenceNumberToTranscript1761956330821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "transcript" ADD "sequenceNumber" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("userId", "jobId") `);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "transcript" DROP COLUMN "sequenceNumber"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("jobId", "userId") `);
    }

}
