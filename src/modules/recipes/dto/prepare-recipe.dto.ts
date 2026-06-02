import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PrepareIngredientDto {
  @ApiPropertyOptional({ example: 'prod_123' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  @IsNotEmpty()
  unit!: string;
}

export class PrepareRecipeDto {
  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  servings?: number;

  @ApiProperty({ type: [PrepareIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrepareIngredientDto)
  ingredients!: PrepareIngredientDto[];
}
