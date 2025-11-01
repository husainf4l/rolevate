import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveInterviewerIdFromInterview1761955074491 implements MigrationInterface {
    name = 'RemoveInterviewerIdFromInterview1761955074491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "interview" DROP CONSTRAINT "FK_540ce8c6be84d9286b5cd0de493"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "interview" DROP COLUMN "interviewerId"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("userId", "jobId") `);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "interview" ADD "interviewerId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("jobId", "userId") `);
        await queryRunner.query(`ALTER TABLE "interview" ADD CONSTRAINT "FK_540ce8c6be84d9286b5cd0de493" FOREIGN KEY ("interviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
