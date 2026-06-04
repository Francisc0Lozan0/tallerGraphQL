import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import { NutritionTracker } from "../nutrition/entities/nutrition-tracker.entity";
import { NutritionProfile } from "../nutrition/entities/nutritionProfile.entity";
import { RecipeIngredient } from "../recipes/entities/recipe-ingredient.entity";
import { Recipe } from "../recipes/entities/recipe.entity";
import { RecommendationFeedback } from "./entities/recommendation-feedback.entity";
import { RecommendationsController } from "./recommendations.controller";
import { RecommendationsResolver } from "./recommendations.resolver";
import { RecommendationsService } from "./recommendations.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationFeedback,
      Recipe,
      RecipeIngredient,
      InventoryItem,
      NutritionProfile,
      NutritionTracker,
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationsResolver],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
