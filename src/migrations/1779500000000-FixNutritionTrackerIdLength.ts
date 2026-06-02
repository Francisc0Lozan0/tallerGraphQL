import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNutritionTrackerIdLength1779500000000 implements MigrationInterface {
    name = 'FixNutritionTrackerIdLength1779500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "nutrition_trackers" ALTER COLUMN "id" TYPE character(24) USING "id"::character(24)`
        );
        await queryRunner.query(
            `ALTER TABLE "nutrition_trackers" ALTER COLUMN "user_id" TYPE character(24) USING "user_id"::character(24)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nutrition_trackers" ALTER COLUMN "user_id" TYPE character`);
        await queryRunner.query(`ALTER TABLE "nutrition_trackers" ALTER COLUMN "id" TYPE character`);
    }
}
