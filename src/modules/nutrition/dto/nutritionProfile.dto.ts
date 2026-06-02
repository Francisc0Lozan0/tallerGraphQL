import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DietType } from '../entities/nutritionProfile.entity';

export class NutritionProfileDto {
  @ApiPropertyOptional({ enum: DietType, default: DietType.Sin_dieta })
  @IsOptional()
  @IsEnum(DietType)
  dietType?: DietType;

  @ApiPropertyOptional({ type: [String], example: ['mani', 'pescado'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedIngredients?: string[];

  @ApiPropertyOptional({ type: [String], example: ['lacteo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];

  @ApiPropertyOptional({ example: 2200 })
  @IsOptional()
  @IsInt()
  @Min(800)
  @Max(6000)
  maxDailyCalories?: number;

  @ApiPropertyOptional({ example: 140 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  targetProtein?: number;

  @ApiPropertyOptional({ example: 220 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  targetCarbs?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(400)
  targetFat?: number;
}
