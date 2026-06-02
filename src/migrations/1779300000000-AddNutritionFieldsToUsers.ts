import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNutritionFieldsToUsers1779300000000 implements MigrationInterface {
    name = 'AddNutritionFieldsToUsers1779300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "birth_date" date NOT NULL DEFAULT '1990-01-01'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sex" character varying(10) NOT NULL DEFAULT 'hombre'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "weight_kg" numeric(6,2) NOT NULL DEFAULT 70`);
        await queryRunner.query(`ALTER TABLE "users" ADD "height_cm" numeric(6,2) NOT NULL DEFAULT 170`);
        await queryRunner.query(`ALTER TABLE "users" ADD "activity_level" character varying(20) NOT NULL DEFAULT 'moderado'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "goal" character varying(20) NOT NULL DEFAULT 'mantener'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "goal"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "activity_level"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height_cm"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weight_kg"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sex"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
    }
}
