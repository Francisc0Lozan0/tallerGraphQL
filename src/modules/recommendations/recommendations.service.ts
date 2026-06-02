import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes } from "crypto";
import { Repository } from "typeorm";
import { InventoryItem } from "../inventory/entities/inventory-item.entity";
import { NutritionTracker } from "../nutrition/entities/nutrition-tracker.entity";
import {
  DietType,
  NutritionProfile,
} from "../nutrition/entities/nutritionProfile.entity";
import { Recipe } from "../recipes/entities/recipe.entity";
import { CreateRecommendationFeedbackDto } from "./dto/create-recommendation-feedback.dto";
import { UpdateRecommendationFeedbackDto } from "./dto/update-recommendation-feedback.dto";
import { RecommendationFeedback } from "./entities/recommendation-feedback.entity";

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(RecommendationFeedback)
    private repo: Repository<RecommendationFeedback>,
    @InjectRepository(Recipe)
    private recipeRepo: Repository<Recipe>,
    @InjectRepository(InventoryItem)
    private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(NutritionProfile)
    private profileRepo: Repository<NutritionProfile>,
    @InjectRepository(NutritionTracker)
    private trackerRepo: Repository<NutritionTracker>,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString("hex");
  }

  private buildIngredientNames(inventory: InventoryItem[]): string[] {
    const seen = new Set<string>();
    const ingredientNames: string[] = [];

    for (const item of inventory) {
      const ingredientName = item.productName?.trim();
      if (!ingredientName) continue;
      const ingredientKey = ingredientName.toLowerCase();

      if (seen.has(ingredientKey)) continue;

      seen.add(ingredientKey);
      ingredientNames.push(ingredientName);

      if (ingredientNames.length >= 20) break;
    }

    return ingredientNames;
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? "").trim().toLowerCase();
  }

  private getDateKey(date: Date = new Date()): string {
    return date.toISOString().slice(0, 10);
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private async ensureTrackerForDate(userId: string, dateKey: string): Promise<NutritionTracker> {
    const date = new Date(dateKey);
    let tracker = await this.trackerRepo.findOneBy({ userId, date });

    if (!tracker) {
      tracker = this.trackerRepo.create({
        id: this.generateId(),
        userId,
        date,
        waterIntakeMl: 0,
        notes: null,
      });
      tracker = await this.trackerRepo.save(tracker);
    }

    return tracker;
  }

  private async addRecipeConsumption(userId: string, recipeId: string) {
    const recipe = await this.recipeRepo.findOneBy({ id: recipeId });
    if (!recipe) {
      throw new NotFoundException("Receta no encontrada para registrar consumo.");
    }

    const dateKey = this.getDateKey();
    const tracker = await this.ensureTrackerForDate(userId, dateKey);

    tracker.totalCalories = this.toNumber(tracker.totalCalories) + this.toNumber(recipe.niCalories);
    tracker.totalProtein = this.toNumber(tracker.totalProtein) + this.toNumber(recipe.niProtein);
    tracker.totalCarbohydrates =
      this.toNumber(tracker.totalCarbohydrates) + this.toNumber(recipe.niCarbohydrates);
    tracker.totalFat = this.toNumber(tracker.totalFat) + this.toNumber(recipe.niFat);
    tracker.totalFiber = this.toNumber(tracker.totalFiber) + this.toNumber(recipe.niFiber);

    await this.trackerRepo.save(tracker);
  }

  private async applyRecipeRating(recipeId: string, rating: number) {
    const recipe = await this.recipeRepo.findOneBy({ id: recipeId });
    if (!recipe) {
      throw new NotFoundException("Receta no encontrada para registrar like.");
    }

    const currentRating = this.toNumber(recipe.rating);
    const currentCount = Math.max(0, this.toNumber(recipe.ratingCount));
    const totalScore = currentRating * currentCount + rating;

    recipe.ratingCount = currentCount + 1;
    recipe.rating = Number((totalScore / recipe.ratingCount).toFixed(2));

    await this.recipeRepo.save(recipe);
  }

  private matchesKeyword(recipe: Recipe, keyword: string): boolean {
    const normalizedKeyword = this.normalizeText(keyword);

    if (!normalizedKeyword) {
      return false;
    }

    const searchableParts = [
      recipe.name,
      recipe.description,
      recipe.category,
      recipe.difficulty,
      ...recipe.ingredients.map((ingredient) => ingredient.genericName ?? ""),
    ].map((part) => this.normalizeText(part));

    return searchableParts.some((part) => part.includes(normalizedKeyword));
  }

  private isProfileCompatible(profile: NutritionProfile | null, recipe: Recipe): boolean {
    if (!profile) {
      return true;
    }

    if (profile.excludedCategories?.some((category) => this.normalizeText(category) === this.normalizeText(recipe.category))) {
      return false;
    }

    if (profile.dietType === DietType.Vegan && !recipe.isVegan) {
      return false;
    }

    if (profile.dietType === DietType.Vegetarian && !recipe.isVegetarian && !recipe.isVegan) {
      return false;
    }

    if (profile.excludedIngredients?.length) {
      const hasExcludedIngredient = profile.excludedIngredients.some((ingredient) =>
        this.matchesKeyword(recipe, ingredient),
      );

      if (hasExcludedIngredient) {
        return false;
      }
    }

    return true;
  }

  private calculateMacroScore(profile: NutritionProfile | null, recipe: Recipe): number {
    if (!profile) {
      return 0;
    }

    let score = 0;

    if (profile.maxDailyCalories) {
      const calories = Number(recipe.niCalories);
      const remainingRatio = Math.max(0, 1 - calories / Math.max(profile.maxDailyCalories, 1));
      score += remainingRatio * 12;
    }

    if (profile.targetProtein) {
      const proteinRatio = Math.min(Number(recipe.niProtein) / Math.max(profile.targetProtein, 1), 1);
      score += proteinRatio * 10;
    }

    if (profile.targetCarbs) {
      const carbsDiff = Math.abs(Number(recipe.niCarbohydrates) - profile.targetCarbs);
      score += Math.max(0, 8 - (carbsDiff / Math.max(profile.targetCarbs, 1)) * 8);
    }

    if (profile.targetFat) {
      const fatDiff = Math.abs(Number(recipe.niFat) - profile.targetFat);
      score += Math.max(0, 6 - (fatDiff / Math.max(profile.targetFat, 1)) * 6);
    }

    if (Number(recipe.niSugars) <= 10) {
      score += 3;
    }

    return score;
  }

  private async findFeedbackByUserAndRecipe(userId: string, recipeId: string) {
    return this.repo.findOneBy({ userId, recipeId });
  }

  async create(
    userId: string,
    createRecommendationFeedbackDto: CreateRecommendationFeedbackDto,
  ) {
    const existing = await this.findFeedbackByUserAndRecipe(
      userId,
      createRecommendationFeedbackDto.recipeId,
    );

    const isLike = createRecommendationFeedbackDto.feedback === "like";
    const shouldApplyLike = isLike && (!existing || existing.feedback !== "like");
    const shouldApplyPrepared = createRecommendationFeedbackDto.prepared === true;

    let saved: RecommendationFeedback;

    const incomingFeedback = createRecommendationFeedbackDto.feedback ?? null;
    const nextFeedback = existing
      ? existing.feedback === "like" && incomingFeedback === "prepared"
        ? existing.feedback
        : incomingFeedback ?? existing.feedback ?? null
      : incomingFeedback;

    if (existing) {
      Object.assign(existing, {
        rating: createRecommendationFeedbackDto.rating,
        prepared: createRecommendationFeedbackDto.prepared ?? existing.prepared ?? false,
        feedback: nextFeedback,
      });

      saved = await this.repo.save(existing);
    } else {
      const feedback = this.repo.create({
        id: this.generateId(),
        userId,
        ...createRecommendationFeedbackDto,
        prepared: createRecommendationFeedbackDto.prepared ?? false,
        feedback: nextFeedback,
      });

      saved = await this.repo.save(feedback);
    }

    if (shouldApplyLike) {
      await this.applyRecipeRating(
        createRecommendationFeedbackDto.recipeId,
        createRecommendationFeedbackDto.rating,
      );
    }

    if (shouldApplyPrepared) {
      await this.addRecipeConsumption(userId, createRecommendationFeedbackDto.recipeId);
    }

    return saved;
  }

  async findAll(recipeId?: string) {
    const where = recipeId ? { recipeId } : {};
    return this.repo.find({
      where,
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const feedback = await this.repo.findOneBy({ id });

    if (!feedback) {
      throw new NotFoundException("Feedback de recomendación no encontrado.");
    }

    return feedback;
  }

  async update(
    id: string,
    updateRecommendationFeedbackDto: UpdateRecommendationFeedbackDto,
  ) {
    const feedback = await this.findOne(id);

    Object.assign(feedback, updateRecommendationFeedbackDto);

    return this.repo.save(feedback);
  }

  async remove(id: string) {
    const feedback = await this.findOne(id);
    return this.repo.remove(feedback);
  }

  async getTopRated(limit = 10) {
    return this.repo.find({
      order: { rating: "DESC" },
      take: Math.max(1, limit),
    });
  }

  async getRecommendations(
    userId: string,
    strictFilter: boolean,
    dateStr: string,
    limit = 10,
    searchQuery?: string,
    filters?: Partial<Record<string, string>>,
  ) {
    // 1. Fetch Profile
    const profile = await this.profileRepo.findOneBy({ userId });

    // 2. Fetch tracking for date
    let remainingCalories = profile?.maxDailyCalories || null;

    if (remainingCalories !== null && dateStr) {
      const tracker = await this.trackerRepo.findOneBy({
        userId,
        date: new Date(dateStr),
      });
      if (tracker) {
        remainingCalories = remainingCalories - Number(tracker.totalCalories);
      }
    }

    // 3. Fetch Inventory
    const inventory = await this.inventoryRepo.find({ where: { userId } });
    const inventoryProductIds = new Set(
      inventory.filter((i) => i.productId).map((i) => i.productId),
    );
    const today = new Date();

    // items expiring within 4 days
    const expiringSoonIds = new Set(
      inventory
        .filter((i) => {
          if (!i.productId) return false;
          const daysDiff =
            (i.expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
          return daysDiff >= 0 && daysDiff <= 4;
        })
        .map((i) => i.productId),
    );

    // 4. Fetch Recipes
    let query = this.recipeRepo
      .createQueryBuilder("recipe")
      .leftJoinAndSelect("recipe.ingredients", "ing");

    // 5. Apply Diet Filters
    if (profile) {
      if (profile.dietType === DietType.Vegan) {
        query = query.andWhere("recipe.is_vegan = true");
      } else if (profile.dietType === DietType.Vegetarian) {
        query = query.andWhere("recipe.is_vegetarian = true OR recipe.is_vegan = true");
      }

      if (profile.excludedCategories?.length > 0) {
        const excludedCategories = profile.excludedCategories.map((category) =>
          this.normalizeText(category),
        );
        query = query.andWhere("LOWER(recipe.category) NOT IN (:...excludedCategories)", {
          excludedCategories,
        });
      }
    }

    const recipes = await query.getMany();
    const normalizedSearchQuery = this.normalizeText(searchQuery);

    const mealType = filters?.mealType ?? null;
    const difficultyFilter = filters?.difficulty ?? null;
    const prepTimeFilter = filters?.prepTime ?? null;
    const ingredientFilter = filters?.ingredient ?? null;
    const excludeIngredientsFilter = filters?.excludeIngredients ?? null;
    const nutritionFilter = filters?.nutrition ?? null;

    // 6. Memory filtering and scoring
    const results: Array<{
      recipe: Recipe;
      score: number;
      matchedIngredientsCount: number;
      totalIngredientsCount: number;
      warning: string | null;
    }> = [];

    for (const recipe of recipes) {
      if (!this.isProfileCompatible(profile, recipe)) {
        continue;
      }

      if (normalizedSearchQuery && !this.matchesKeyword(recipe, normalizedSearchQuery)) {
        continue;
      }

      // Apply mealType -> category mapping (basic Spanish->EN mappings)
      if (mealType) {
        const map: Record<string, string> = {
          desayuno: 'breakfast',
          almuerzo: 'lunch',
          cena: 'dinner',
          snack: 'snack',
          postre: 'dessert',
          bebidas: 'beverage',
          'comida rápida': 'lunch',
        };
        const mapped = map[this.normalizeText(mealType)];
        if (mapped && this.normalizeText(recipe.category) !== mapped) {
          continue;
        }
      }

      // Difficulty mapping (Spanish)
      if (difficultyFilter) {
        const diffMap: Record<string, string> = { 'fácil': 'easy', 'intermedia': 'medium', 'difícil': 'hard' } as any;
        const mapped = diffMap[this.normalizeText(difficultyFilter)];
        if (mapped && recipe.difficulty !== mapped) {
          continue;
        }
      }

      // Prep time ranges
      if (prepTimeFilter) {
        const nf = this.normalizeText(prepTimeFilter);
        const prep = recipe.preparationTime ?? 0;
        if (nf.includes('menos') && prep > 15) continue;
        if (nf.includes('15') && (prep < 15 || prep > 30)) continue;
        if (nf.includes('30') && (prep < 30 || prep > 60)) continue;
        if (nf.includes('más') && prep <= 60) continue;
      }

      // Nutrition filters (calories ranges)
      if (nutritionFilter) {
        const nf = this.normalizeText(nutritionFilter);
        const cal = Number(recipe.niCalories || 0);
        if (nf.includes('menos') && cal >= 300) continue;
        if (nf.includes('300') && (cal < 300 || cal > 600)) continue;
        if (nf.includes('más') && cal <= 600) continue;
      }

      // Ingredient include/exclude
      if (ingredientFilter && !this.matchesKeyword(recipe, ingredientFilter)) {
        continue;
      }

      if (excludeIngredientsFilter) {
        const parts = excludeIngredientsFilter.split(',').map((s) => s.trim()).filter(Boolean);
        const hasExcluded = parts.some((part) => this.matchesKeyword(recipe, part));
        if (hasExcluded) continue;
      }

      // Cuisine/objective/dessert/bakery/beverage are best-effort: try matchesKeyword against category/description
      if (filters?.cuisine && !this.matchesKeyword(recipe, filters.cuisine)) continue;
      if (filters?.objective && !this.matchesKeyword(recipe, filters.objective)) continue;
      if (filters?.dessert && !this.matchesKeyword(recipe, filters.dessert)) continue;
      if (filters?.bakery && !this.matchesKeyword(recipe, filters.bakery)) continue;
      if (filters?.beverage && !this.matchesKeyword(recipe, filters.beverage)) continue;

      // Check Calories Over limits
      let warning: string | null = null;
      if (remainingCalories !== null) {
        const diff = Number(recipe.niCalories) - remainingCalories;
        if (diff > 300) {
          continue; // eliminate entirely if it exceeds by > 300 kcal
        } else if (diff > 0) {
          warning = `Cuidado: Esta receta excede tu límite de calorías restante por ${Math.round(diff)} kcal.`;
        }
      }

      // Strict Filter Check
      if (strictFilter) {
        // all non-optional ingredients must be in inventory
        const possible = recipe.ingredients.every(
          (ing) =>
            ing.optional ||
            (ing.productId && inventoryProductIds.has(ing.productId)),
        );
        if (!possible) continue;
      }

      // 7. Calculate Score
      let score = 0;

      // Points for community rating
      score += Number(recipe.rating || 0) * 4;
      score += Math.min(recipe.ratingCount || 0, 20) * 0.5;

      // Prefer recipes aligned with the user's nutrition goals
      score += this.calculateMacroScore(profile, recipe);

      let matchedItems = 0;
      for (const ing of recipe.ingredients) {
        if (ing.productId && inventoryProductIds.has(ing.productId)) {
          score += 10;
          matchedItems++;
          if (expiringSoonIds.has(ing.productId)) {
            score += 30; // High bonus for saving waste
          }
        }
      }

      const ingredientMatchRatio =
        recipe.ingredients.length > 0 ? matchedItems / recipe.ingredients.length : 0;
      score += ingredientMatchRatio * 15;

      // Variety randomization (0 to 5)
      score += Math.random() * 5;

      if (warning) {
        score -= 2;
      }

      results.push({
        recipe,
        score,
        matchedIngredientsCount: matchedItems,
        totalIngredientsCount: recipe.ingredients.length,
        warning,
      });
    }

    // 8. Sort by Score and return
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
