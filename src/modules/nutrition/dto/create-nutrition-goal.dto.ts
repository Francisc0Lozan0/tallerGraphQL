import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateNutritionGoalDto {
  @IsInt()
  @Min(1000)
  goalDailyCalories: number;

  @IsNumber()
  @Min(0)
  goalProteinGrams: number;

  @IsNumber()
  @Min(0)
  goalCarbohydratesGrams: number;

  @IsNumber()
  @Min(0)
  goalFatGrams: number;

  @IsNumber()
  @Min(0)
  goalFiberGrams: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goalSugarLimitGrams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goalSodiumLimitMg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  goalWaterMl?: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}