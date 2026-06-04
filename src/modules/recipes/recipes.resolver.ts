import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  Float,
  InputType,
  Int,
  Mutation,
  PartialType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@InputType()
class RecipeFilterInput {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  isPublic?: boolean;
}

@InputType()
class CreateRecipeInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category!: string;

  @Field()
  difficulty!: string;

  @Field(() => Int, { nullable: true })
  preparationTime?: number;

  @Field(() => Int, { nullable: true })
  cookingTime?: number;

  @Field(() => Int, { nullable: true })
  servings?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  isPublic?: boolean;

  @Field(() => Float, { nullable: true })
  niCalories?: number;

  @Field(() => Float, { nullable: true })
  niProtein?: number;

  @Field(() => Float, { nullable: true })
  niCarbohydrates?: number;

  @Field(() => Float, { nullable: true })
  niFat?: number;

  @Field(() => Float, { nullable: true })
  niFiber?: number;

  @Field(() => Float, { nullable: true })
  niSugars?: number;

  @Field(() => Float, { nullable: true })
  niSodium?: number;

  @Field({ nullable: true })
  niServingSize?: string;

  @Field(() => Int, { nullable: true })
  niServingsPerRecipe?: number;
}

@InputType()
class UpdateRecipeInput extends PartialType(CreateRecipeInput) {}

@InputType()
class RateRecipeInput {
  @Field(() => Int)
  rating!: number;
}

@InputType()
class PrepareRecipeIngredientInput {
  @Field({ nullable: true })
  productId?: string;

  @Field(() => Float)
  quantity!: number;

  @Field()
  unit!: string;
}

@InputType()
class PrepareRecipeInput {
  @Field(() => Int, { nullable: true })
  servings?: number;

  @Field(() => [PrepareRecipeIngredientInput])
  ingredients!: PrepareRecipeIngredientInput[];
}

@Resolver(() => Recipe)
export class RecipesResolver {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Recipe)
  createRecipe(@Args('input') input: CreateRecipeInput) {
    return this.recipesService.create(input as any);
  }

  @Query(() => [Recipe])
  recipes(
    @Args('filter', { type: () => RecipeFilterInput, nullable: true })
    filter?: RecipeFilterInput,
  ) {
    return this.recipesService.findAll({
      q: filter?.q,
      category: filter?.category,
      difficulty: filter?.difficulty,
      isPublic: filter?.isPublic === undefined ? undefined : String(filter.isPublic),
    });
  }

  @Query(() => Recipe)
  recipe(@Args('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Mutation(() => Recipe)
  updateRecipe(@Args('id') id: string, @Args('input') input: UpdateRecipeInput) {
    return this.recipesService.update(id, input as any);
  }

  @Mutation(() => Recipe)
  rateRecipe(@Args('id') id: string, @Args('input') input: RateRecipeInput) {
    return this.recipesService.rate(id, input.rating);
  }

  @Mutation(() => Recipe)
  @UseGuards(JwtAuthGuard)
  prepareRecipe(
    @Args('id') id: string,
    @Args('input') input: PrepareRecipeInput,
    @Context('req') request: RequestWithUser,
  ) {
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    return this.recipesService.prepare(id, userId, input as any);
  }

  @Mutation(() => Recipe)
  deleteRecipe(@Args('id') id: string) {
    return this.recipesService.remove(id);
  }

  @ResolveField(() => User, { nullable: true })
  user(@Parent() recipe: Recipe) {
    return this.usersService.findById(recipe.userId);
  }
}