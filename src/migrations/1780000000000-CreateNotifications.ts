import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1780000000000 implements MigrationInterface {
  name = 'CreateNotifications1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" character(24) NOT NULL,
        "user_id" character(24) NOT NULL,
        "type" character varying(40) NOT NULL,
        "title" character varying(150) NOT NULL,
        "message" text NOT NULL,
        "entity_type" character varying(40),
        "entity_id" character(24),
        "metadata" jsonb,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_user_created" ON "notifications" ("user_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications" ("user_id", "is_read")`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_notifications_user'
            AND table_name = 'notifications'
        ) THEN
          ALTER TABLE "notifications"
            ADD CONSTRAINT "FK_notifications_user"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_notifications_user_read"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_notifications_user_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
  }
}