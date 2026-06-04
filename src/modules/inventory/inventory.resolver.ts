import { UseGuards } from '@nestjs/common';
import { Args, Context, Field, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { ConsumeInventoryItemsDto } from './dto/consume-inventory-items.dto';

interface RequestWithUser {
  user?: {
    id?: string;
    role?: string;
  };
}

@InputType()
class InventoryFilter {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
class InventoryStats {
  @Field(() => Int)
  totalItems!: number;

  @Field(() => Int)
  expiringSoon!: number;

  @Field(() => Int)
  expired!: number;
}

@ObjectType()
class ConsumeInventoryResponse {
  @Field(() => [InventoryItem])
  updated!: InventoryItem[];

  @Field(() => [InventoryItem])
  removed!: InventoryItem[];
}

@Resolver(() => InventoryItem)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Mutation(() => InventoryItem)
  @UseGuards(JwtAuthGuard)
  createInventoryItem(
    @Args('input') input: CreateInventoryItemDto,
    @Context('req') req: RequestWithUser,
  ) {
    return this.inventoryService.create({
      ...input,
      userId: input.userId || req.user?.id,
    } as any);
  }

  @Query(() => [InventoryItem])
  @UseGuards(JwtAuthGuard)
  inventoryItems(
    @Context('req') req: RequestWithUser,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('filter', { type: () => InventoryFilter, nullable: true }) filter?: InventoryFilter,
  ) {
    const isAdmin = req.user?.role === Role.Admin;
    const targetUserId = isAdmin ? userId : (req.user?.id as string);
    
    return this.inventoryService.findAll(targetUserId, {
      q: filter?.q,
      category: filter?.category,
    });
  }

  @Query(() => InventoryStats)
  @UseGuards(JwtAuthGuard)
  inventoryStats(
    @Context('req') req: RequestWithUser,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ) {
    const isAdmin = req.user?.role === Role.Admin;
    const targetUserId = isAdmin ? (userId || (req.user?.id as string)) : (req.user?.id as string);
    return this.inventoryService.stats(targetUserId);
  }

  @Query(() => InventoryItem)
  @UseGuards(JwtAuthGuard)
  inventoryItem(@Args('id') id: string, @Context('req') req: RequestWithUser) {
    const isAdmin = req.user?.role === Role.Admin;
    const userId = isAdmin ? undefined : (req.user?.id as string);
    return this.inventoryService.findOne(id, userId);
  }

  @Mutation(() => InventoryItem)
  @UseGuards(JwtAuthGuard)
  updateInventoryItem(
    @Args('id') id: string,
    @Args('input') input: UpdateInventoryItemDto,
    @Context('req') req: RequestWithUser,
  ) {
    const isAdmin = req.user?.role === Role.Admin;
    const userId = isAdmin ? undefined : (req.user?.id as string);
    return this.inventoryService.update(id, userId, input);
  }

  @Mutation(() => ConsumeInventoryResponse)
  @UseGuards(JwtAuthGuard)
  consumeInventoryItems(
    @Args('input') input: ConsumeInventoryItemsDto,
    @Context('req') req: RequestWithUser,
  ) {
    return this.inventoryService.consumeItems(req.user?.id as string, input.items);
  }

  @Mutation(() => InventoryItem)
  @UseGuards(JwtAuthGuard)
  deleteInventoryItem(@Args('id') id: string, @Context('req') req: RequestWithUser) {
    const isAdmin = req.user?.role === Role.Admin;
    const userId = isAdmin ? undefined : (req.user?.id as string);
    return this.inventoryService.remove(id, userId);
  }
}
