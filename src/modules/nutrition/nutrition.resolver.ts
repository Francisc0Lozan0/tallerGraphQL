import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NutritionService } from './nutrition.service';
import { NutritionProfileResponseDto } from './dto/nutritionProfileResponse.dto';
import { NutritionProfileDto } from './dto/nutritionProfile.dto';
import { CreateNutritionTrackerDto } from './dto/create-nutrition-tracker.dto';
import { NutritionTracker } from './entities/nutrition-tracker.entity';
import { UpdateNutritionTrackerDto } from './dto/update-nutrition-tracker.dto';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@Resolver()
export class NutritionResolver {
  constructor(private readonly nutritionService: NutritionService) {}

  @Query(() => NutritionProfileResponseDto)
  @UseGuards(JwtAuthGuard)
  nutritionProfile(@Context('req') request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.nutritionService.getMyProfile(userId);
  }

  @Mutation(() => NutritionProfileResponseDto)
  @UseGuards(JwtAuthGuard)
  upsertNutritionProfile(
    @Context('req') request: RequestWithUser,
    @Args('input') input: NutritionProfileDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.upsertMyProfile(userId, input);
  }

  @Mutation(() => NutritionTracker)
  @UseGuards(JwtAuthGuard)
  createNutritionTracker(
    @Context('req') request: RequestWithUser,
    @Args('input') input: CreateNutritionTrackerDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.createTracker(userId, input);
  }

  @Query(() => NutritionTracker, { nullable: true })
  @UseGuards(JwtAuthGuard)
  nutritionTrackerByDate(
    @Context('req') request: RequestWithUser,
    @Args('date') date: string,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.findTrackerByDate(userId, date);
  }

  @Mutation(() => NutritionTracker)
  @UseGuards(JwtAuthGuard)
  updateNutritionTracker(
    @Context('req') request: RequestWithUser,
    @Args('id') id: string,
    @Args('input') input: UpdateNutritionTrackerDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.updateTracker(id, userId, input);
  }

  @Mutation(() => NutritionGoal)
  @UseGuards(JwtAuthGuard)
  createNutritionGoal(
    @Context('req') request: RequestWithUser,
    @Args('input') input: CreateNutritionGoalDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.createGoal(userId, input);
  }

  @Query(() => NutritionGoal, { nullable: true })
  @UseGuards(JwtAuthGuard)
  activeNutritionGoal(@Context('req') request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.nutritionService.getActiveGoal(userId);
  }

  @Mutation(() => NutritionGoal)
  @UseGuards(JwtAuthGuard)
  updateNutritionGoal(
    @Context('req') request: RequestWithUser,
    @Args('id') id: string,
    @Args('input') input: UpdateNutritionGoalDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.updateGoal(id, userId, input);
  }

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user not found');
    }
    return userId;
  }
}
