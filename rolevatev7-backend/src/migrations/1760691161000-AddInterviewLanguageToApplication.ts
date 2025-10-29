import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInterviewLanguageToApplication1760691161000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'application',
      new TableColumn({
        name: 'interviewLanguage',
        type: 'varchar',
        default: "'english'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('application', 'interviewLanguage');
  }
}
