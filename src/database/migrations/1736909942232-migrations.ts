import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736909942232 implements MigrationInterface {
    name = 'Migrations1736909942232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lease\` DROP FOREIGN KEY \`FK_4c70866646fc716981bf9a81638\``);
        await queryRunner.query(`DROP INDEX \`REL_4c70866646fc716981bf9a8163\` ON \`lease\``);
        await queryRunner.query(`ALTER TABLE \`lease\` DROP COLUMN \`documentId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lease\` ADD \`documentId\` varchar(36) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_4c70866646fc716981bf9a8163\` ON \`lease\` (\`documentId\`)`);
        await queryRunner.query(`ALTER TABLE \`lease\` ADD CONSTRAINT \`FK_4c70866646fc716981bf9a81638\` FOREIGN KEY (\`documentId\`) REFERENCES \`document\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
