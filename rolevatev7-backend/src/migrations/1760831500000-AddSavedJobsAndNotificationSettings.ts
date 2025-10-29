import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSavedJobsAndNotificationSettings1760831500000 implements MigrationInterface {
    name = 'AddSavedJobsAndNotificationSettings1760831500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create notification_settings table
        await queryRunner.query(`
            CREATE TABLE "notification_settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "emailNotifications" boolean NOT NULL DEFAULT true,
                "emailApplicationUpdates" boolean NOT NULL DEFAULT true,
                "emailInterviewReminders" boolean NOT NULL DEFAULT true,
                "emailJobRecommendations" boolean NOT NULL DEFAULT true,
                "emailNewsletter" boolean NOT NULL DEFAULT true,
                "smsNotifications" boolean NOT NULL DEFAULT false,
                "smsApplicationUpdates" boolean NOT NULL DEFAULT false,
                "smsInterviewReminders" boolean NOT NULL DEFAULT false,
                "pushNotifications" boolean NOT NULL DEFAULT true,
                "pushApplicationUpdates" boolean NOT NULL DEFAULT true,
                "pushInterviewReminders" boolean NOT NULL DEFAULT true,
                "pushNewMessages" boolean NOT NULL DEFAULT true,
                "marketingEmails" boolean NOT NULL DEFAULT false,
                "partnerOffers" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5a8ffc3b89343043c9440d631e2" UNIQUE ("userId"),
                CONSTRAINT "REL_5a8ffc3b89343043c9440d631e" UNIQUE ("userId"),
                CONSTRAINT "PK_d131abd7996c475ef768d4559ba" PRIMARY KEY ("id")
            )
        `);

        // Create saved_job table
        await queryRunner.query(`
            CREATE TABLE "saved_job" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "jobId" uuid NOT NULL,
                "savedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "notes" text,
                CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId"),
                CONSTRAINT "PK_eec7a26a4f0a651ab3d63c2a4a6" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "notification_settings"
            ADD CONSTRAINT "FK_5a8ffc3b89343043c9440d631e2"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "saved_job"
            ADD CONSTRAINT "FK_65314280f947dd20a26faf013d2"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "saved_job"
            ADD CONSTRAINT "FK_ceb2154a962ca924a284f15c2e7"
            FOREIGN KEY ("jobId") REFERENCES "job"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "FK_ceb2154a962ca924a284f15c2e7"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "FK_65314280f947dd20a26faf013d2"`);
        await queryRunner.query(`ALTER TABLE "notification_settings" DROP CONSTRAINT "FK_5a8ffc3b89343043c9440d631e2"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "saved_job"`);
        await queryRunner.query(`DROP TABLE "notification_settings"`);
    }
}