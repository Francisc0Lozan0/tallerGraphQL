import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

interface RequestWithUser {
  user?: {
    id?: string;
    role?: string;
  };
}

@Resolver()
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  createInventoryItem(
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
    @Context('req') req: RequestWithUser,
  ) {
    return this.inventoryService.create({
      ...input,
      userId: input.userId || req.user?.id,
    } as any);
  }

  @Query(() => [GraphQLJSON])
  @UseGuards(JwtAuthGuard)
  inventoryItems(
    @Context('req') req: RequestWithUser,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('filter', { type: () => GraphQLJSON, nullable: true }) filter?: Record<string, any>,
  ) {
    const isAdmin = req.user?.role === Role.Admin;
    const targetUserId = isAdmin ? userId : (req.user?.id as string);
    
    return this.inventoryService.findAll(targetUserId, {
      q: filter?.q,
      category: filter?.category,
    });
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  inventoryStats(
    @Context('req') req: RequestWithUser,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ) {
    const isAdmin = req.user?.role === Role.Admin;
    const targetUserId = isAdmin ? (userId || (req.user?.id as string)) : (req.user?.id as string);
    return this.inventoryService.stats(targetUserId);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  inventoryItem(@Args('id') id: string, @Context('req') req: RequestWithUser) {
    const isAdmin = req.user?.role === Role.Admin;
    const userId = isAdmin ? undefined : (req.user?.id as string);
    return this.inventoryService.findOne(id, userId);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  updateInventoryItem(
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
    @Context('req') req: RequestWithUser,
  ) {
    const isAdmin = req.user?.role === Role.Admin;
    const userId = isAdmin ? undefined : (req.user?.id as string);
    return this.inventoryService.update(id, userId, input as any);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  consumeInventoryItems(
    @Args('items', { type: () => GraphQLJSON }) items: any,
    @Context('req') req: RequestWithUser,
  ) {
    return this.inventoryService.consumeItems(req.user?.id as string, items);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  deleteInventoryItem(@Args('id') id: string, @Context('req') req: RequestWithUser) {
    const isAdmin = req.user?.role === Role.Admin;
    const userId = isAdmin ? undefined : (req.user?.id as string);
    return this.inventoryService.remove(id, userId);
  }
}
