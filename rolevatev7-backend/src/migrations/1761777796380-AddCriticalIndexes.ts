import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCriticalIndexes1761777796380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for better query performance
        
        // User table indexes
        await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "user" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_phone" ON "user" ("phone")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_company" ON "user" ("companyId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_type_active" ON "user" ("userType", "isActive")`);
        
        // Application table indexes
        await queryRunner.query(`CREATE INDEX "IDX_application_job_candidate" ON "application" ("jobId", "candidateId")`);
        await queryRunner.query(`CREATE INDEX "IDX_application_status" ON "application" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_application_job_status" ON "application" ("jobId", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_application_candidate" ON "application" ("candidateId")`);
        await queryRunner.query(`CREATE INDEX "IDX_application_applied_at" ON "application" ("appliedAt" DESC)`);
        
        // Communication table indexes
        await queryRunner.query(`CREATE INDEX "IDX_communication_phone" ON "communication" ("phoneNumber")`);
        await queryRunner.query(`CREATE INDEX "IDX_communication_email" ON "communication" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_communication_type_status" ON "communication" ("type", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_communication_application" ON "communication" ("applicationId")`);
        await queryRunner.query(`CREATE INDEX "IDX_communication_sent_at" ON "communication" ("sentAt" DESC)`);
        
        // Notification table indexes
        await queryRunner.query(`CREATE INDEX "IDX_notification_user_read" ON "notification" ("userId", "read")`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_category" ON "notification" ("category")`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_created_at" ON "notification" ("createdAt" DESC)`);
        
        // Job table indexes
        await queryRunner.query(`CREATE INDEX "IDX_job_company_status" ON "job" ("companyId", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_job_status_deadline" ON "job" ("status", "deadline")`);
        await queryRunner.query(`CREATE INDEX "IDX_job_posted_by" ON "job" ("postedById")`);
        await queryRunner.query(`CREATE INDEX "IDX_job_created_at" ON "job" ("createdAt" DESC)`);
        
        // Candidate Profile indexes
        await queryRunner.query(`CREATE INDEX "IDX_candidate_profile_phone" ON "candidate_profile" ("phone")`);
        await queryRunner.query(`CREATE INDEX "IDX_candidate_profile_availability" ON "candidate_profile" ("availability")`);
        
        // Interview table indexes
        await queryRunner.query(`CREATE INDEX "IDX_interview_application" ON "interview" ("applicationId")`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_interviewer" ON "interview" ("interviewerId")`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_status" ON "interview" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_interview_scheduled_at" ON "interview" ("scheduledAt")`);
        
        // Invitation table indexes
        await queryRunner.query(`CREATE INDEX "IDX_invitation_code" ON "invitation" ("code")`);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_email" ON "invitation" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_company_status" ON "invitation" ("companyId", "status")`);
        await queryRunner.query(`CREATE INDEX "IDX_invitation_expires_at" ON "invitation" ("expiresAt")`);
        
        // Password Reset table
        await queryRunner.query(`CREATE TABLE "password_reset" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "email" character varying NOT NULL, 
            "token" character varying NOT NULL, 
            "expiresAt" TIMESTAMP NOT NULL, 
            "used" boolean NOT NULL DEFAULT false, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_password_reset_id" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_token" ON "password_reset" ("token")`);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_email" ON "password_reset" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_expires" ON "password_reset" ("expiresAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_token_used" ON "password_reset" ("token", "used")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop Password Reset table
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_token_used"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_expires"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_token"`);
        await queryRunner.query(`DROP TABLE "password_reset"`);
        
        // Drop invitation indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_expires_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_company_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invitation_code"`);
        
        // Drop interview indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_scheduled_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_interviewer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_interview_application"`);
        
        // Drop candidate profile indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_candidate_profile_availability"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_candidate_profile_phone"`);
        
        // Drop job indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_job_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posted_by"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_status_deadline"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_company_status"`);
        
        // Drop notification indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_notification_user_read"`);
        
        // Drop communication indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_sent_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_application"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_type_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_communication_phone"`);
        
        // Drop application indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_application_applied_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_candidate"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_job_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_application_job_candidate"`);
        
        // Drop user indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_user_type_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_company"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_email"`);
    }

}
