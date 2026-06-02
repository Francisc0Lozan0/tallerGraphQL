import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
} from '../entities/recipe.entity';

export class CreateRecipeDto {
  @ApiProperty({ example: 'Ensalada César' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Receta rápida' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RECIPE_CATEGORIES })
  @IsString()
  @IsIn(RECIPE_CATEGORIES)
  category: (typeof RECIPE_CATEGORIES)[number];

  @ApiProperty({ enum: RECIPE_DIFFICULTIES })
  @IsString()
  @IsIn(RECIPE_DIFFICULTIES)
  difficulty: (typeof RECIPE_DIFFICULTIES)[number];

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  preparationTime?: number;

  @ApiPropertyOptional({ example: 15, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cookingTime?: number;

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @ApiPropertyOptional({ example: 'https://example.com/recipe.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;


  @ApiPropertyOptional({ example: 300, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niCalories?: number;

  @ApiPropertyOptional({ example: 20, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niProtein?: number;

  @ApiPropertyOptional({ example: 40, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niCarbohydrates?: number;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niFat?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niFiber?: number;

  @ApiPropertyOptional({ example: 6, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niSugars?: number;

  @ApiPropertyOptional({ example: 200, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niSodium?: number;

  @ApiPropertyOptional({ example: '1 plato' })
  @IsOptional()
  @IsString()
  niServingSize?: string;

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  niServingsPerRecipe?: number;
}