import { DietType } from '../entities/nutritionProfile.entity';

export class NutritionProfileResponseDto {
  id!: string;
  userId!: string;
  dietType!: DietType;
  excludedIngredients!: string[];
  excludedCategories!: string[];
  maxDailyCalories!: number | null;
  targetProtein!: number | null;
  targetCarbs!: number | null;
  targetFat!: number | null;
  strictInventoryOnly!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
