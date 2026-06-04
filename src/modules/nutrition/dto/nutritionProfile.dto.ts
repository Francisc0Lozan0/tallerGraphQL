import { Field, InputType, Int } from '@nestjs/graphql';
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

@InputType()
export class NutritionProfileDto {
  @Field(() => DietType, { nullable: true })
  @ApiPropertyOptional({ enum: DietType, default: DietType.Sin_dieta })
  @IsOptional()
  @IsEnum(DietType)
  dietType?: DietType;

  @Field(() => [String], { nullable: true })
  @ApiPropertyOptional({ type: [String], example: ['mani', 'pescado'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedIngredients?: string[];

  @Field(() => [String], { nullable: true })
  @ApiPropertyOptional({ type: [String], example: ['lacteo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 2200 })
  @IsOptional()
  @IsInt()
  @Min(800)
  @Max(6000)
  maxDailyCalories?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 140 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  targetProtein?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 220 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  targetCarbs?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(400)
  targetFat?: number;
}
