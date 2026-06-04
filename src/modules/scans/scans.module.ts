import { Module } from '@nestjs/common';
import { ScansController } from './scans.controller';
import { ScansResolver } from './scans.resolver';
import { ScansService } from './scans.service';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [InventoryModule, NotificationsModule],
  controllers: [ScansController],
  providers: [ScansService, ScansResolver],
})
export class ScansModule {}
