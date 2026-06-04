import { InputType, PartialType } from '@nestjs/graphql';
import { CreateInventoryItemDto } from './create-inventory-item.dto';

@InputType()
export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {}
    