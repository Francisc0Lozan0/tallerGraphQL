import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from '../entities/inventory-item.entity';

@InputType()
export class CreateInventoryItemDto {
  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'user_123' })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field()
  @ApiProperty({ example: 'Manzana' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'prod_123' })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ enum: INVENTORY_CATEGORIES })
  @IsOptional()
  @IsString()
  @IsIn(INVENTORY_CATEGORIES)
  category?: string;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @Field({ nullable: true })
  @ApiPropertyOptional({ enum: INVENTORY_UNITS })
  @IsOptional()
  @IsString()
  @IsIn(INVENTORY_UNITS)
  unit?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '2026-04-26T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '2026-05-26T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Cocina' })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '7501031311309' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Sin azúcar' })
  @IsOptional()
  @IsString()
  notes?: string;
}