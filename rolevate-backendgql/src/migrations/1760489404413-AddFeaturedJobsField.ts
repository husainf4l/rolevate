import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedJobsField1760489404413 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "job"
            ADD COLUMN "featuredJobs" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "job"
            DROP COLUMN "featuredJobs"
        `);
    }

}
