import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { DietType } from '../entities/nutritionProfile.entity';

@ObjectType()
export class NutritionProfileResponseDto {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field(() => DietType)
  dietType!: DietType;

  @Field(() => [String])
  excludedIngredients!: string[];

  @Field(() => [String])
  excludedCategories!: string[];

  @Field(() => Int, { nullable: true })
  maxDailyCalories!: number | null;

  @Field(() => Int, { nullable: true })
  targetProtein!: number | null;

  @Field(() => Int, { nullable: true })
  targetCarbs!: number | null;

  @Field(() => Int, { nullable: true })
  targetFat!: number | null;

  @Field()
  strictInventoryOnly!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
