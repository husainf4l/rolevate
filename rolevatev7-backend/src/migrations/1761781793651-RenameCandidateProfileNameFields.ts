import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCandidateProfileNameFields1761781793651 implements MigrationInterface {
    name = 'RenameCandidateProfileNameFields1761781793651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_job_company_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_status_deadline"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posted_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_user_read"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_job_candidate"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_job_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_candidate"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_applied_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_application"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_interviewer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_scheduled_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_company_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_expires_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_type_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_application"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_sent_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_expires"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_token_used"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`ALTER TABLE "candidate_profile" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "candidate_profile" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "candidate_profile" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("userId", "jobId") `);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "candidate_profile" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "candidate_profile" ADD "lastName" character varying`);
        await queryRunner.query(`ALTER TABLE "candidate_profile" ADD "firstName" character varying`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("jobId", "userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_token_used" ON "password_reset" ("token", "used") `);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_expires" ON "password_reset" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_email" ON "password_reset" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_token" ON "password_reset" ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_communication_sent_at" ON "communication" ("sentAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_communication_application" ON "communication" ("applicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_communication_type_status" ON "communication" ("status", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_communication_email" ON "communication" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_communication_phone" ON "communication" ("phoneNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_expires_at" ON "invitation" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_company_status" ON "invitation" ("companyId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_email" ON "invitation" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_code" ON "invitation" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_scheduled_at" ON "interview" ("scheduledAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_status" ON "interview" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_interviewer" ON "interview" ("interviewerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_interview_application" ON "interview" ("applicationId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("jobId", "userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_application_applied_at" ON "application" ("appliedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_application_candidate" ON "application" ("candidateId") `);
        await queryRunner.query(`CREATE INDEX "IDX_application_job_status" ON "application" ("jobId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_application_status" ON "application" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_application_job_candidate" ON "application" ("candidateId", "jobId") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_created_at" ON "notification" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_category" ON "notification" ("category") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_user_read" ON "notification" ("read", "userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_created_at" ON "job" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_posted_by" ON "job" ("postedById") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_status_deadline" ON "job" ("deadline", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_company_status" ON "job" ("companyId", "status") `);
    }

}
