import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { PrepareRecipeDto } from './dto/prepare-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private repo: Repository<Recipe>,
    private inventoryService: InventoryService,
    private notificationsService: NotificationsService,
    private nutritionService: NutritionService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const recipe = this.repo.create({
      id: randomUUID(),
      ...createRecipeDto,
      rating: 0,
      ratingCount: 0,
      isCustom: true,
    });

    return this.repo.save(recipe);
  }

  async findAll(query?: {
    q?: string;
    category?: string;
    difficulty?: string;
    isPublic?: string;
  }) {
    const where: any = {};

    if (query?.q) {
      where.name = ILike(`%${query.q}%`);
    }

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query?.isPublic !== undefined) {
      where.isPublic = query.isPublic === 'true';
    }

    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const recipe = await this.repo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.product', 'product')
      .where('recipe.id = :id', { id })
      .orderBy('ingredients.createdAt', 'ASC')
      .getOne();

    if (!recipe) {
      throw new NotFoundException('Receta no encontrada.');
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto, requesterUserId?: string, isAdmin?: boolean) {
    const recipe = await this.findOne(id);

    if (!isAdmin && requesterUserId && recipe.userId !== requesterUserId) {
      throw new NotFoundException('No tienes permiso para actualizar esta receta o no existe.');
    }

    Object.assign(recipe, updateRecipeDto);

    return this.repo.save(recipe);
  }

  async remove(id: string, requesterUserId?: string, isAdmin?: boolean) {
    const recipe = await this.findOne(id);

    if (!isAdmin && requesterUserId && recipe.userId !== requesterUserId) {
      throw new NotFoundException('No tienes permiso para eliminar esta receta o no existe.');
    }

    return this.repo.remove(recipe);
  }

  async rate(id: string, rating: number) {
    const recipe = await this.findOne(id);

    const totalScore = recipe.rating * recipe.ratingCount + rating;
    recipe.ratingCount += 1;
    recipe.rating = Number((totalScore / recipe.ratingCount).toFixed(2));

    return this.repo.save(recipe);
  }

  async prepare(id: string, userId: string, payload: PrepareRecipeDto) {
    const recipe = await this.findOne(id);

    const consumed: Array<{ consumed: number; unit: string; productId: string }> = [];
    const consumedIngredients: Array<{ name: string; quantity: number; unit: string }> = [];

    for (const ingredient of payload.ingredients) {
      if (!ingredient.productId) {
        continue;
      }

      const recipeIngredient = recipe.ingredients.find(
        (item) => item.productId === ingredient.productId,
      );
      const ingredientName =
        recipeIngredient?.product?.name ?? recipeIngredient?.genericName ?? ingredient.productId;

      const result = await this.inventoryService.consumeByProductId(
        userId,
        ingredient.productId,
        ingredient.quantity,
        ingredient.unit,
      );

      consumed.push(result);
      consumedIngredients.push({
        name: ingredientName,
        quantity: result.consumed,
        unit: result.unit,
      });
    }

    if (consumedIngredients.length > 0) {
      await this.notificationsService.createRecipeConsumptionNotification(
        userId,
        recipe,
        consumedIngredients,
        payload.servings ?? null,
      );
    }

    const baseServings = recipe.niServingsPerRecipe || recipe.servings || 1;
    const servings = payload.servings ?? recipe.servings ?? baseServings;
    const factor = Math.max(servings, 1) / Math.max(baseServings, 1);
    const calories = Number(recipe.niCalories ?? 0) * factor;
    const protein = Number(recipe.niProtein ?? 0) * factor;
    const carbs = Number(recipe.niCarbohydrates ?? 0) * factor;
    const fat = Number(recipe.niFat ?? 0) * factor;
    const fiber = Number(recipe.niFiber ?? 0) * factor;

    const dateKey = new Date().toISOString().slice(0, 10);
    await this.nutritionService.addMacroConsumptionByDate(
      userId,
      dateKey,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    );

    return {
      recipeId: id,
      servings: payload.servings ?? null,
      consumed,
    };
  }
}