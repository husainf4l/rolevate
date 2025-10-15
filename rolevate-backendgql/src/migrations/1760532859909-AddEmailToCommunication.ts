import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToCommunication1760532859909 implements MigrationInterface {
    name = 'AddEmailToCommunication1760532859909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "communication" DROP CONSTRAINT "FK_46d87ba383d66fe91cf2b47963c"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP CONSTRAINT "FK_b60ec750c6d4edc5299b6f34c26"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "isRead"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "senderId"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "recipientId"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "subject"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "candidateId" character varying`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "companyId" character varying`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "jobId" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."communication_direction_enum" AS ENUM('INBOUND', 'OUTBOUND')`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "direction" "public"."communication_direction_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "whatsappId" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."communication_status_enum" AS ENUM('SENT', 'DELIVERED', 'READ', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "status" "public"."communication_status_enum" NOT NULL DEFAULT 'SENT'`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "templateName" character varying`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "templateParams" json`);
        await queryRunner.query(`ALTER TYPE "public"."report_schedule_frequency_enum" RENAME TO "report_schedule_frequency_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."report_schedule_frequency_enum" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM')`);
        await queryRunner.query(`ALTER TABLE "report_schedule" ALTER COLUMN "frequency" TYPE "public"."report_schedule_frequency_enum" USING "frequency"::"text"::"public"."report_schedule_frequency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."report_schedule_frequency_enum_old"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "communication" DROP CONSTRAINT "FK_6fdd6bffa041d6a6b4c0184ccbf"`);
        await queryRunner.query(`ALTER TABLE "communication" ALTER COLUMN "applicationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD CONSTRAINT "FK_6fdd6bffa041d6a6b4c0184ccbf" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "communication" DROP CONSTRAINT "FK_6fdd6bffa041d6a6b4c0184ccbf"`);
        await queryRunner.query(`ALTER TABLE "communication" ALTER COLUMN "applicationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD CONSTRAINT "FK_6fdd6bffa041d6a6b4c0184ccbf" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "live_kit_room" ADD CONSTRAINT "PK_5db8ccc7afe73509bf9bf3e6bf2" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE TYPE "public"."report_schedule_frequency_enum_old" AS ENUM('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM')`);
        await queryRunner.query(`ALTER TABLE "report_schedule" ALTER COLUMN "frequency" TYPE "public"."report_schedule_frequency_enum_old" USING "frequency"::"text"::"public"."report_schedule_frequency_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."report_schedule_frequency_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."report_schedule_frequency_enum_old" RENAME TO "report_schedule_frequency_enum"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "templateParams"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "templateName"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."communication_status_enum"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "whatsappId"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "direction"`);
        await queryRunner.query(`DROP TYPE "public"."communication_direction_enum"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "jobId"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "communication" DROP COLUMN "candidateId"`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "message" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "subject" character varying`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "recipientId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "senderId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "communication" ADD "isRead" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "communication" ADD CONSTRAINT "FK_b60ec750c6d4edc5299b6f34c26" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "communication" ADD CONSTRAINT "FK_46d87ba383d66fe91cf2b47963c" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
