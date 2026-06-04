import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

@InputType()
export class CreateNutritionGoalDto {
  @Field(() => Int)
  @IsInt()
  @Min(1000)
  goalDailyCalories: number;

  @Field()
  @IsNumber()
  @Min(0)
  goalProteinGrams: number;

  @Field()
  @IsNumber()
  @Min(0)
  goalCarbohydratesGrams: number;

  @Field()
  @IsNumber()
  @Min(0)
  goalFatGrams: number;

  @Field()
  @IsNumber()
  @Min(0)
  goalFiberGrams: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  goalSugarLimitGrams?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  goalSodiumLimitMg?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalWaterMl?: number;

  @Field()
  @IsDateString()
  startDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}