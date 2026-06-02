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

export class CreateInventoryItemDto {
  @ApiPropertyOptional({ example: 'user_123' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'Manzana' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiPropertyOptional({ example: 'prod_123' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ enum: INVENTORY_CATEGORIES })
  @IsOptional()
  @IsString()
  @IsIn(INVENTORY_CATEGORIES)
  category?: (typeof INVENTORY_CATEGORIES)[number];

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ enum: INVENTORY_UNITS })
  @IsOptional()
  @IsString()
  @IsIn(INVENTORY_UNITS)
  unit?: (typeof INVENTORY_UNITS)[number];

  @ApiPropertyOptional({ example: '2026-04-26T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: '2026-05-26T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ example: 'Cocina' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '7501031311309' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 'Sin azúcar' })
  @IsOptional()
  @IsString()
  notes?: string;
}