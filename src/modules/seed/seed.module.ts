import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { NutritionProfile } from '../nutrition/entities/nutritionProfile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      Recipe,
      InventoryItem,
      NutritionProfile,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
