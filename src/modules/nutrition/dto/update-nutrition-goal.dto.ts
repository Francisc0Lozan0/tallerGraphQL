import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateNutritionGoalDto } from './create-nutrition-goal.dto';

@InputType()
export class UpdateNutritionGoalDto extends PartialType(CreateNutritionGoalDto) {
  @Field(() => Int, { nullable: true })
  goalDailyCalories?: number;

  @Field({ nullable: true })
  goalProteinGrams?: number;

  @Field({ nullable: true })
  goalCarbohydratesGrams?: number;

  @Field({ nullable: true })
  goalFatGrams?: number;

  @Field({ nullable: true })
  goalFiberGrams?: number;

  @Field({ nullable: true })
  goalSugarLimitGrams?: number;

  @Field({ nullable: true })
  goalSodiumLimitMg?: number;

  @Field(() => Int, { nullable: true })
  goalWaterMl?: number;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}
