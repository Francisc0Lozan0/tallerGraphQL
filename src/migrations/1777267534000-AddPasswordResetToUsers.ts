import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetToUsers1777267534000 implements MigrationInterface {
    name = 'AddPasswordResetToUsers1777267534000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token_expires_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token"`);
    }
}
