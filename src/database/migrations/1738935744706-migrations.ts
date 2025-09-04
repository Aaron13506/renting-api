import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738935744706 implements MigrationInterface {
    name = 'Migrations1738935744706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`billing\` ADD \`paymentReceipt\` varchar(250) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`billing\` DROP COLUMN \`paymentReceipt\``);
    }

}
