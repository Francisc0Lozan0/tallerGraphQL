import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NutritionService } from './nutrition.service';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@Resolver()
export class NutritionResolver {
  constructor(private readonly nutritionService: NutritionService) {}

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  nutritionProfile(@Context('req') request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.nutritionService.getMyProfile(userId);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  upsertNutritionProfile(
    @Context('req') request: RequestWithUser,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.upsertMyProfile(userId, input as any);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  createNutritionTracker(
    @Context('req') request: RequestWithUser,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.createTracker(userId, input as any);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  nutritionTrackerByDate(
    @Context('req') request: RequestWithUser,
    @Args('date') date: string,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.findTrackerByDate(userId, date);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  updateNutritionTracker(
    @Context('req') request: RequestWithUser,
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.updateTracker(id, userId, input as any);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  createNutritionGoal(
    @Context('req') request: RequestWithUser,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.createGoal(userId, input as any);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  activeNutritionGoal(@Context('req') request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.nutritionService.getActiveGoal(userId);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  updateNutritionGoal(
    @Context('req') request: RequestWithUser,
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.updateGoal(id, userId, input as any);
  }

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user not found');
    }
    return userId;
  }
}
