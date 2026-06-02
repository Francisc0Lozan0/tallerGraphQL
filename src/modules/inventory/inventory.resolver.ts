import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

interface RequestWithUser {
  user?: {
    id?: string;
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
      userId: req.user?.id,
    } as any);
  }

  @Query(() => [GraphQLJSON])
  @UseGuards(JwtAuthGuard)
  inventoryItems(
    @Context('req') req: RequestWithUser,
    @Args('filter', { type: () => GraphQLJSON, nullable: true }) filter?: Record<string, any>,
  ) {
    return this.inventoryService.findAll(req.user?.id as string, {
      q: filter?.q,
      category: filter?.category,
    });
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  inventoryStats(@Context('req') req: RequestWithUser) {
    return this.inventoryService.stats(req.user?.id as string);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  inventoryItem(@Args('id') id: string, @Context('req') req: RequestWithUser) {
    return this.inventoryService.findOne(id, req.user?.id as string);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  updateInventoryItem(
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
    @Context('req') req: RequestWithUser,
  ) {
    return this.inventoryService.update(id, req.user?.id as string, input as any);
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
    return this.inventoryService.remove(id, req.user?.id as string);
  }
}
