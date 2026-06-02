import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778104251283 implements MigrationInterface {
    name = 'Init1778104251283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "fk_ri_product"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ri_product"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ri_recipe"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "chk_ri_unit"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "product_name"`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD "is_vegetarian" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD "is_vegan" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "generic_name" character varying(150)`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "optional" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "recipe_id"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "recipe_id" character NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "unit" character varying(30) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_recipe_ingredients_product" ON "recipe_ingredients" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "idx_recipe_ingredients_recipe" ON "recipe_ingredients" ("recipe_id") `);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "FK_f240137e0e13bed80bdf64fed53" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP CONSTRAINT "FK_f240137e0e13bed80bdf64fed53"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recipe_ingredients_recipe"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recipe_ingredients_product"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "unit" character varying(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "recipe_id"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "recipe_id" character(24) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "optional"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" DROP COLUMN "generic_name"`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "is_vegan"`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "is_vegetarian"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD "product_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token_expires_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "chk_ri_unit" CHECK (((unit)::text = ANY ((ARRAY['g'::character varying, 'ml'::character varying, 'unit'::character varying, 'kg'::character varying, 'l'::character varying, 'oz'::character varying, 'cup'::character varying, 'tbsp'::character varying, 'tsp'::character varying])::text[])))`);
        await queryRunner.query(`CREATE INDEX "idx_ri_recipe" ON "recipe_ingredients" ("recipe_id") `);
        await queryRunner.query(`CREATE INDEX "idx_ri_product" ON "recipe_ingredients" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "fk_ri_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
