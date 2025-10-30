import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicantFieldsToApplication1698715200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application"
      ADD COLUMN IF NOT EXISTS "applicant_name" varchar,
      ADD COLUMN IF NOT EXISTS "applicant_email" varchar,
      ADD COLUMN IF NOT EXISTS "applicant_phone" varchar,
      ADD COLUMN IF NOT EXISTS "applicant_linkedin" varchar;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "application"
      DROP COLUMN IF EXISTS "applicant_linkedin",
      DROP COLUMN IF EXISTS "applicant_phone",
      DROP COLUMN IF EXISTS "applicant_email",
      DROP COLUMN IF EXISTS "applicant_name";
    `);
  }
}
