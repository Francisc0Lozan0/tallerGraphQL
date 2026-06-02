import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotificationTypeConstraint1780100000000 implements MigrationInterface {
    name = 'UpdateNotificationTypeConstraint1780100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "chk_notif_type"`,
        );
        await queryRunner.query(
            `UPDATE "notifications" SET "type" = 'scan_unrecognized'
             WHERE "type" NOT IN ('expiration_warning','expired_item','stock_low','stock_depleted','scan_unrecognized','recipe_consumption')`,
        );
        await queryRunner.query(
            `ALTER TABLE "notifications" ADD CONSTRAINT "chk_notif_type" CHECK ("type" IN ('expiration_warning','expired_item','stock_low','stock_depleted','scan_unrecognized','recipe_consumption'))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "chk_notif_type"`,
        );
        await queryRunner.query(
            `ALTER TABLE "notifications" ADD CONSTRAINT "chk_notif_type" CHECK ("type" IN ('expiration_warning','expired_item','stock_low','stock_depleted','scan_unrecognized'))`,
        );
    }
}
