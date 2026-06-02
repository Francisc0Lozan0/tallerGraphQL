import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNutritionProfileSetupFlag1779600000000 implements MigrationInterface {
    name = 'AddNutritionProfileSetupFlag1779600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "nutrition_profiles" ADD "is_setup_complete" boolean NOT NULL DEFAULT false`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "nutrition_profiles" DROP COLUMN "is_setup_complete"`,
        );
    }
}
