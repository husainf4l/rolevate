import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogTable1761793531237 implements MigrationInterface {
    name = 'AddAuditLogTable1761793531237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_user_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_company"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_type_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_COMPLETE', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'API_KEY_GENERATED', 'API_KEY_REVOKED', 'API_KEY_INVALID', 'JOB_CREATED', 'JOB_UPDATED', 'JOB_DELETED', 'JOB_PUBLISHED', 'APPLICATION_CREATED', 'APPLICATION_UPDATED', 'APPLICATION_DELETED', 'APPLICATION_STATUS_CHANGED', 'APPLICATION_NOTE_CREATED', 'APPLICATION_NOTE_UPDATED', 'APPLICATION_NOTE_DELETED', 'NOTIFICATION_CREATED', 'NOTIFICATION_READ', 'NOTIFICATION_DELETED', 'BULK_NOTIFICATION_READ', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS', 'FORBIDDEN_ACCESS', 'SECURITY_EVENT', 'BRUTE_FORCE_ATTEMPT', 'INVALID_TOKEN', 'SUSPICIOUS_ACTIVITY', 'SYSTEM_ERROR', 'DATA_EXPORT', 'DATA_IMPORT', 'DATA_DELETION', 'CONFIG_CHANGE')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" character varying NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL, "userId" character varying, "userEmail" character varying, "resourceType" character varying, "resourceId" character varying, "description" text, "metadata" json, "ipAddress" character varying, "userAgent" character varying, "requestId" character varying, "isSystemAction" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c69efb19bf127c97e6740ad530" ON "audit_logs" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_0ec936941eb8556fcd7a1f0eae" ON "audit_logs" ("action", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_99e589da8f9e9326ee0d01a028" ON "audit_logs" ("userId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_reset" ADD CONSTRAINT "UQ_36e929b98372d961bb63bd4b4e9" UNIQUE ("token")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("userId", "jobId") `);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_email" ON "password_reset" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_password_reset_token" ON "password_reset" ("token") `);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e78c19878d2e6143e4c6140c81"`);
        await queryRunner.query(`ALTER TABLE "password_reset" DROP CONSTRAINT "UQ_36e929b98372d961bb63bd4b4e9"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD "notes" text`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99e589da8f9e9326ee0d01a028"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ec936941eb8556fcd7a1f0eae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c69efb19bf127c97e6740ad530"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfa83f61e4d27a87fcae1e025a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e78c19878d2e6143e4c6140c81" ON "saved_job" ("jobId", "userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_type_active" ON "user" ("isActive", "userType") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_company" ON "user" ("companyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_phone" ON "user" ("phone") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "user" ("email") `);
    }

}
