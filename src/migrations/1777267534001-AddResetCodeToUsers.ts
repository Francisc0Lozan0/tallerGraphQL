import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetCodeToUsers1777267534001 implements MigrationInterface {
    name = 'AddResetCodeToUsers1777267534001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_code" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_code_expires_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_code_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_code"`);
    }
}
