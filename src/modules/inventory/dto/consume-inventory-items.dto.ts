import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

export class ConsumeInventoryItemDto {
  @ApiProperty({ example: 'b1f9e9d6c0a24b9f8d2a1c34' })
  @IsString()
  id: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ConsumeInventoryItemsDto {
  @ApiProperty({ type: [ConsumeInventoryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumeInventoryItemDto)
  items: ConsumeInventoryItemDto[];
}
