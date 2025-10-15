import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTypeEnum1760509160000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "user_usertype_enum" RENAME VALUE 'COMPANY' TO 'BUSINESS'`);
        await queryRunner.query(`ALTER TYPE "invitation_usertype_enum" RENAME VALUE 'COMPANY' TO 'BUSINESS'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "invitation_usertype_enum" RENAME VALUE 'BUSINESS' TO 'COMPANY'`);
        await queryRunner.query(`ALTER TYPE "user_usertype_enum" RENAME VALUE 'BUSINESS' TO 'COMPANY'`);
    }

}
