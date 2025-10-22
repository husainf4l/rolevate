import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLiveKitRooms1729594800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create livekit_rooms table
    await queryRunner.createTable(
      new Table({
        name: 'livekit_rooms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'roomName',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'roomSid',
            type: 'varchar',
          },
          {
            name: 'roomPassword',
            type: 'varchar',
          },
          {
            name: 'passwordExpiresAt',
            type: 'timestamp',
          },
          {
            name: 'passwordUsed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'applicationId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to application table
    await queryRunner.createForeignKey(
      'livekit_rooms',
      new TableForeignKey({
        columnNames: ['applicationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'application',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('livekit_rooms');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('applicationId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('livekit_rooms', foreignKey);
    }

    // Drop table
    await queryRunner.dropTable('livekit_rooms');
  }
}
