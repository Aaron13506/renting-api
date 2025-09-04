import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736911894899 implements MigrationInterface {
    name = 'Migrations1736911894899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`document-version\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(250) NULL, \`status\` varchar(250) NULL, \`contentUrl\` varchar(250) NULL, \`uploadedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`signedById\` varchar(36) NULL, \`documentIdId\` varchar(36) NULL, UNIQUE INDEX \`REL_2963f67aab499cf19276c7d635\` (\`documentIdId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`document\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(250) NULL, \`status\` varchar(250) NULL, \`contentUrl\` varchar(250) NULL, \`uploadedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`uploadedById\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`document-version\` ADD CONSTRAINT \`FK_f0f5d1742ae51837f7466467ae7\` FOREIGN KEY (\`signedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document-version\` ADD CONSTRAINT \`FK_2963f67aab499cf19276c7d6357\` FOREIGN KEY (\`documentIdId\`) REFERENCES \`document\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`document\` ADD CONSTRAINT \`FK_efb7e46d33872b088a2014d7975\` FOREIGN KEY (\`uploadedById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lease\` ADD CONSTRAINT \`FK_4c70866646fc716981bf9a81638\` FOREIGN KEY (\`documentId\`) REFERENCES \`document\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`lease\` DROP FOREIGN KEY \`FK_4c70866646fc716981bf9a81638\``);
        await queryRunner.query(`ALTER TABLE \`document\` DROP FOREIGN KEY \`FK_efb7e46d33872b088a2014d7975\``);
        await queryRunner.query(`ALTER TABLE \`document-version\` DROP FOREIGN KEY \`FK_2963f67aab499cf19276c7d6357\``);
        await queryRunner.query(`ALTER TABLE \`document-version\` DROP FOREIGN KEY \`FK_f0f5d1742ae51837f7466467ae7\``);
        await queryRunner.query(`DROP TABLE \`document\``);
        await queryRunner.query(`DROP INDEX \`REL_2963f67aab499cf19276c7d635\` ON \`document-version\``);
        await queryRunner.query(`DROP TABLE \`document-version\``);
    }

}
