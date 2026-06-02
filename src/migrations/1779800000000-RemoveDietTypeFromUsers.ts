import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDietTypeFromUsers1779800000000 implements MigrationInterface {
    name = 'RemoveDietTypeFromUsers1779800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN IF EXISTS "diet_type"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "diet_type" character varying(20)`
        );
    }
}
