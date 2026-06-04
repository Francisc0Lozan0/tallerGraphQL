import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorePricesController } from './store-prices.controller';
import { StorePricesResolver } from './store-prices.resolver';
import { StorePricesService } from './store-prices.service';
import { Store } from './entities/store.entity';
import { StorePrice } from './entities/store-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StorePrice])],
  controllers: [StorePricesController],
  providers: [StorePricesService, StorePricesResolver],
  exports: [StorePricesService],
})
export class StorePricesModule {}
