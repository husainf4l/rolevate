import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLinkedInUrlToCandidateProfile1760815210309 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before adding it
        const table = await queryRunner.getTable('candidate_profile');
        const column = table?.findColumnByName('linkedinUrl');
        
        if (!column) {
            await queryRunner.query(`ALTER TABLE "candidate_profile" ADD "linkedinUrl" character varying`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before dropping it
        const table = await queryRunner.getTable('candidate_profile');
        const column = table?.findColumnByName('linkedinUrl');
        
        if (column) {
            await queryRunner.query(`ALTER TABLE "candidate_profile" DROP COLUMN "linkedinUrl"`);
        }
    }

}

