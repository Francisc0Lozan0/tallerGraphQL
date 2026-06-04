import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Field, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { RecommendationFeedback } from './entities/recommendation-feedback.entity';
import { CreateRecommendationFeedbackDto } from './dto/create-recommendation-feedback.dto';
import { UpdateRecommendationFeedbackDto } from './dto/update-recommendation-feedback.dto';
import { Recipe } from '../recipes/entities/recipe.entity';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@InputType()
class RecommendationSuggestInput {
  @Field({ nullable: true })
  strict?: boolean;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field({ nullable: true })
  date?: string;

  @Field({ nullable: true })
  query?: string;

  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  mealType?: string;

  @Field({ nullable: true })
  cuisine?: string;

  @Field(() => [String], { nullable: true })
  restrictions?: string[];

  @Field(() => Int, { nullable: true })
  prepTime?: number;

  @Field(() => Int, { nullable: true })
  budget?: number;

  @Field({ nullable: true })
  nutrition?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  ingredient?: string;

  @Field(() => [String], { nullable: true })
  excludeIngredients?: string[];

  @Field({ nullable: true })
  objective?: string;

  @Field({ nullable: true })
  dessert?: boolean;

  @Field({ nullable: true })
  bakery?: boolean;

  @Field({ nullable: true })
  beverage?: boolean;
}

@ObjectType()
class DeleteRecommendationResponse {
  @Field()
  deleted!: boolean;
}

@Resolver(() => RecommendationFeedback)
export class RecommendationsResolver {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Mutation(() => RecommendationFeedback)
  @UseGuards(JwtAuthGuard)
  createRecommendationFeedback(
    @Context('req') request: RequestWithUser,
    @Args('input') input: CreateRecommendationFeedbackDto,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.recommendationsService.create(userId, input);
  }

  @Query(() => [Recipe])
  @UseGuards(JwtAuthGuard)
  recommendationsSuggest(
    @Context('req') request: RequestWithUser,
    @Args('input') input: RecommendationSuggestInput,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const isStrict = input.strict === true;
    const limitNum = input.limit ?? 10;

    return this.recommendationsService.getRecommendations(
      userId,
      isStrict,
      input.date ?? new Date().toISOString().split('T')[0],
      limitNum,
      input.query ?? input.q,
      {
        mealType: input.mealType,
        cuisine: input.cuisine,
        restrictions: input.restrictions?.join(','),
        prepTime: input.prepTime?.toString(),
        budget: input.budget?.toString(),
        nutrition: input.nutrition,
        difficulty: input.difficulty,
        ingredient: input.ingredient,
        excludeIngredients: input.excludeIngredients?.join(','),
        objective: input.objective,
        dessert: input.dessert?.toString(),
        bakery: input.bakery?.toString(),
        beverage: input.beverage?.toString(),
      },
    );
  }

  @Query(() => [RecommendationFeedback])
  @UseGuards(JwtAuthGuard)
  recommendations(
    @Args('recipeId', { nullable: true }) recipeId?: string,
  ) {
    return this.recommendationsService.findAll(recipeId);
  }

  @Query(() => [RecommendationFeedback])
  @UseGuards(JwtAuthGuard)
  topRatedRecommendations(@Args('limit', { nullable: true }) limit?: number) {
    return this.recommendationsService.getTopRated(limit);
  }

  @Query(() => RecommendationFeedback)
  @UseGuards(JwtAuthGuard)
  recommendation(@Args('id') id: string) {
    return this.recommendationsService.findOne(id);
  }

  @Mutation(() => RecommendationFeedback)
  @UseGuards(JwtAuthGuard)
  updateRecommendationFeedback(
    @Args('id') id: string,
    @Args('input') input: UpdateRecommendationFeedbackDto,
  ) {
    return this.recommendationsService.update(id, input);
  }

  @Mutation(() => DeleteRecommendationResponse)
  @UseGuards(JwtAuthGuard)
  async deleteRecommendationFeedback(@Args('id') id: string) {
    await this.recommendationsService.remove(id);
    return { deleted: true };
  }
}
