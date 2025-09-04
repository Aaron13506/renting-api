import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736286081077 implements MigrationInterface {
    name = 'Migrations1736286081077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`community-message\` (\`id\` varchar(36) NOT NULL, \`message\` varchar(255) NULL, \`individualMessage\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userFromId\` varchar(36) NULL, \`userToId\` varchar(36) NULL, \`propertyId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`community-message\` ADD CONSTRAINT \`FK_8fd171d2dd1ec317abbcd522363\` FOREIGN KEY (\`userFromId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`community-message\` ADD CONSTRAINT \`FK_87744053cdc809a81a0d3a491c5\` FOREIGN KEY (\`userToId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`community-message\` ADD CONSTRAINT \`FK_c5615c376cbaa76249cc30552bc\` FOREIGN KEY (\`propertyId\`) REFERENCES \`property\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`community-message\` DROP FOREIGN KEY \`FK_c5615c376cbaa76249cc30552bc\``);
        await queryRunner.query(`ALTER TABLE \`community-message\` DROP FOREIGN KEY \`FK_87744053cdc809a81a0d3a491c5\``);
        await queryRunner.query(`ALTER TABLE \`community-message\` DROP FOREIGN KEY \`FK_8fd171d2dd1ec317abbcd522363\``);
        await queryRunner.query(`DROP TABLE \`community-message\``);
    }

}
