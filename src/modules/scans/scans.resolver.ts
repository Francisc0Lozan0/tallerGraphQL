import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  Float,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryService } from '../inventory/inventory.service';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@InputType()
class ConfirmScanInput {
  @Field()
  detectedName!: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Float)
  quantity!: number;

  @Field({ nullable: true })
  productId?: string;

  @Field()
  unit!: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
class ConfirmScanResponse {
  @Field(() => InventoryItem)
  saved!: InventoryItem;
}

@Resolver()
export class ScansResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Mutation(() => ConfirmScanResponse)
  @UseGuards(JwtAuthGuard)
  async confirmScan(
    @Args('input') input: ConfirmScanInput,
    @Context('req') request: RequestWithUser,
  ) {
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const saved = await this.inventoryService.create({
      userId,
      productName: input.detectedName,
      productId: input.productId,
      category: input.category as any,
      quantity: input.quantity,
      unit: input.unit,
      notes: input.notes,
      expirationDate: expirationDate.toISOString(),
    });

    return {
      saved: {
        ...saved,
        quantity: Number(saved.quantity),
      },
    };
  }
}