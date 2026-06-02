import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from '../../inventory/entities/inventory-item.entity';
import type { InventoryCategory } from '../../inventory/entities/inventory-item.entity';

export class ConfirmScanDto {
  @ApiProperty({ example: 'manzana' })
  @IsString()
  @IsNotEmpty()
  detectedName!: string;

  @ApiPropertyOptional({ enum: INVENTORY_CATEGORIES })
  @IsOptional()
  @IsString()
  @IsIn(INVENTORY_CATEGORIES)
  category?: InventoryCategory;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ example: 'prod_123' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ enum: INVENTORY_UNITS, example: 'units' })
  @IsString()
  @IsIn(INVENTORY_UNITS)
  unit!: (typeof INVENTORY_UNITS)[number];

  @ApiPropertyOptional({ example: 'Paquete mediano' })
  @IsOptional()
  @IsString()
  notes?: string;
}
