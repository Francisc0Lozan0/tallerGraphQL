import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

@InputType()
export class ConsumeInventoryItemDto {
  @Field()
  @ApiProperty({ example: 'b1f9e9d6c0a24b9f8d2a1c34' })
  @IsString()
  id: string;

  @Field(() => Int)
  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class ConsumeInventoryItemsDto {
  @Field(() => [ConsumeInventoryItemDto])
  @ApiProperty({ type: [ConsumeInventoryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumeInventoryItemDto)
  items: ConsumeInventoryItemDto[];
}
