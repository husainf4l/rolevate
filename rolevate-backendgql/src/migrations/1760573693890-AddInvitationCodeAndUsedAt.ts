import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvitationCodeAndUsedAt1760573693890 implements MigrationInterface {
    name = 'AddInvitationCodeAndUsedAt1760573693890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitation" ADD "code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD CONSTRAINT "UQ_d23721ee8274af12ae925994257" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "usedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "invitation" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitation" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "usedAt"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "UQ_d23721ee8274af12ae925994257"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "code"`);
    }

}
