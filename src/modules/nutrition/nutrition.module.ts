import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { NutritionTracker } from './entities/nutrition-tracker.entity';
import { NutritionProfile } from './entities/nutritionProfile.entity';
import { NutritionController } from './nutrition.controller';
import { NutritionResolver } from './nutrition.resolver';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionProfile, NutritionTracker, NutritionGoal])],
  controllers: [NutritionController],
  providers: [NutritionService, NutritionResolver],
  exports: [NutritionService],
})
export class NutritionModule {}
