import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@Resolver()
export class RecommendationsResolver {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  createRecommendationFeedback(
    @Context('req') request: RequestWithUser,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.recommendationsService.create(userId, input as any);
  }

  @Query(() => [GraphQLJSON])
  @UseGuards(JwtAuthGuard)
  recommendationsSuggest(
    @Context('req') request: RequestWithUser,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const isStrict = input.strict === true || input.strict === 'true';
    const limitNum = input.limit ? Number(input.limit) : 10;

    return this.recommendationsService.getRecommendations(
      userId,
      isStrict,
      input.date,
      limitNum,
      input.query ?? input.q,
      {
        mealType: input.mealType,
        cuisine: input.cuisine,
        restrictions: input.restrictions,
        prepTime: input.prepTime,
        budget: input.budget,
        nutrition: input.nutrition,
        difficulty: input.difficulty,
        ingredient: input.ingredient,
        excludeIngredients: input.excludeIngredients,
        objective: input.objective,
        dessert: input.dessert,
        bakery: input.bakery,
        beverage: input.beverage,
      },
    );
  }

  @Query(() => [GraphQLJSON])
  @UseGuards(JwtAuthGuard)
  recommendations(
    @Args('recipeId', { nullable: true }) recipeId?: string,
  ) {
    return this.recommendationsService.findAll(recipeId);
  }

  @Query(() => [GraphQLJSON])
  @UseGuards(JwtAuthGuard)
  topRatedRecommendations(@Args('limit', { nullable: true }) limit?: number) {
    return this.recommendationsService.getTopRated(limit);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  recommendation(@Args('id') id: string) {
    return this.recommendationsService.findOne(id);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  updateRecommendationFeedback(
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    return this.recommendationsService.update(id, input as any);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  deleteRecommendationFeedback(@Args('id') id: string) {
    return this.recommendationsService.remove(id);
  }
}
