import { Field, Float, InputType, Int } from '@nestjs/graphql';
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

@InputType()
export class CreateProductDto {
  @Field()
  @ApiProperty({ example: 'Yogur Natural' })
  @IsString()
  @MinLength(2)
  name: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Yogur sin azúcar' })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Marca X' })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field()
  @ApiProperty({ enum: PRODUCT_CATEGORIES })
  @IsString()
  @IsIn(PRODUCT_CATEGORIES)
  category: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '7501031311309' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @Field()
  @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'openfoodfacts' })
  @IsOptional()
  @IsString()
  externalSource?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'off:123' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niCalories?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niProtein?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 12, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niCarbohydrates?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 3, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niFat?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niFiber?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 8, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niSugars?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  niSodium?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '100g' })
  @IsOptional()
  @IsString()
  niServingSize?: string;
}