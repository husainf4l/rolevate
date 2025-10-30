import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameApplicantColumnsToCAmelCase1698715300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename snake_case columns to camelCase to match TypeORM convention
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicant_name" TO "applicantName";
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicant_email" TO "applicantEmail";
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicant_phone" TO "applicantPhone";
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicant_linkedin" TO "applicantLinkedin";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to snake_case
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicantName" TO "applicant_name";
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicantEmail" TO "applicant_email";
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicantPhone" TO "applicant_phone";
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      RENAME COLUMN "applicantLinkedin" TO "applicant_linkedin";
    `);
  }
}
