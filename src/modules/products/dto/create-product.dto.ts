import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_CATEGORIES } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'Yogur Natural' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Yogur sin azúcar' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Marca X' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ enum: PRODUCT_CATEGORIES })
  @IsString()
  @IsIn(PRODUCT_CATEGORIES)
  category: (typeof PRODUCT_CATEGORIES)[number];

  @ApiPropertyOptional({ example: '7501031311309' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'openfoodfacts' })
  @IsOptional()
  @IsString()
  externalSource?: string;

  @ApiPropertyOptional({ example: 'off:123' })
  @IsOptional()
  @IsString()
  externalId?: string;


  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niCalories?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niProtein?: number;

  @ApiPropertyOptional({ example: 12, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niCarbohydrates?: number;

  @ApiPropertyOptional({ example: 3, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niFat?: number;

  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niFiber?: number;

  @ApiPropertyOptional({ example: 8, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niSugars?: number;

  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niSodium?: number;

  @ApiPropertyOptional({ example: '100g' })
  @IsOptional()
  @IsString()
  niServingSize?: string;
}