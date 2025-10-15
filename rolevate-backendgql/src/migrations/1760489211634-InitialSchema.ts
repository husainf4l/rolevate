import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760489211634 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create User table
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM('CANDIDATE', 'BUSINESS')
        `);

        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'CANDIDATE',
                "name" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

        // Create unique index on email
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email")
        `);

        // Create Job table
        await queryRunner.query(`
            CREATE TABLE "job" (
                "id" character varying NOT NULL,
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "company" character varying NOT NULL,
                "location" character varying NOT NULL,
                "salary" numeric(10,2),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "postedById" character varying NOT NULL,
                CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id")
            )
        `);

        // Create foreign key constraint for Job.postedById
        await queryRunner.query(`
            ALTER TABLE "job"
            ADD CONSTRAINT "FK_3b57d5a6b0b7e3e4c3b3b3b3b3b"
            FOREIGN KEY ("postedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Create Notification table
        await queryRunner.query(`
            CREATE TYPE "notification_type_enum" AS ENUM('JOB_APPLICATION', 'JOB_UPDATE', 'SYSTEM', 'MARKETING')
        `);

        await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" character varying NOT NULL,
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "type" "notification_type_enum" NOT NULL DEFAULT 'SYSTEM',
                "isRead" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "readAt" TIMESTAMP,
                "userId" character varying NOT NULL,
                "metadata" json,
                CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id")
            )
        `);

        // Create foreign key constraint for Notification.userId
        await queryRunner.query(`
            ALTER TABLE "notification"
            ADD CONSTRAINT "FK_1ced25315b8ef6d898de3a0cffe"
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315b8ef6d898de3a0cffe"`);
        await queryRunner.query(`ALTER TABLE "job" DROP CONSTRAINT "FK_3b57d5a6b0b7e3e4c3b3b3b3b3b"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "job"`);
        await queryRunner.query(`DROP TABLE "user"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "notification_type_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }

}
