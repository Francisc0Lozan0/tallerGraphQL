import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryModule } from "../inventory/inventory.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { RecipeIngredient } from "./entities/recipe-ingredient.entity";
import { Recipe } from "./entities/recipe.entity";
import { RecipesController } from "./recipes.controller";
import { RecipesResolver } from "./recipes.resolver";
import { RecipesService } from "./recipes.service";
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeIngredient]), InventoryModule, NotificationsModule, NutritionModule, UsersModule],
  controllers: [RecipesController],
  providers: [RecipesService, RecipesResolver],
})
export class RecipesModule {}
