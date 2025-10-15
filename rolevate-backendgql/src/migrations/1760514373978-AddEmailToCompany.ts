import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToCompany1760514373978 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD COLUMN "email" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD COLUMN "phone" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "email"`);
    }

}
