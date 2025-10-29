import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScoreFieldsToApplication1760816827274 implements MigrationInterface {
    name = 'AddScoreFieldsToApplication1760816827274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" ADD "cvScore" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "application" ADD "firstInterviewScore" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "application" ADD "secondInterviewScore" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "application" ADD "finalScore" numeric(5,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "finalScore"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "secondInterviewScore"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "firstInterviewScore"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "cvScore"`);
    }

}
