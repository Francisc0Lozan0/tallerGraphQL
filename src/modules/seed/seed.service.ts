import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { DeepPartial, Repository } from 'typeorm';
import { ActivityLevel, NutritionGoal, Sex, User } from '../users/entities/user.entity';
import { Product, ProductCategory } from '../products/entities/product.entity';
import {
  Recipe,
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
} from '../recipes/entities/recipe.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { NutritionProfile, DietType } from '../nutrition/entities/nutritionProfile.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(Recipe)
    private readonly recipesRepo: Repository<Recipe>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(NutritionProfile)
    private readonly nutritionRepo: Repository<NutritionProfile>,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  async seed() {
    const summary = {
      users: 0,
      products: 0,
      recipes: 0,
      inventory: 0,
      nutritionProfiles: 0,
    };

    const adminEmail =
      this.configService.get<string>('SEED_ADMIN_EMAIL') ||
      'admin@alacena.local';
    const adminPassword =
      this.configService.get<string>('SEED_ADMIN_PASSWORD') || 'Admin123!';
    const userEmail =
      this.configService.get<string>('SEED_USER_EMAIL') ||
      'user@alacena.local';
    const userPassword =
      this.configService.get<string>('SEED_USER_PASSWORD') || 'User123!';

    const [admin, adminCreated] = await this.ensureUser({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Alacena',
      role: 'admin',
    });
    if (adminCreated) {
      summary.users += 1;
    }

    const [user, userCreated] = await this.ensureUser({
      email: userEmail,
      password: userPassword,
      firstName: 'User',
      lastName: 'Demo',
      role: 'user',
    });
    if (userCreated) {
      summary.users += 1;
    }

    const products = await this.seedProducts();
    summary.products += products;

    const recipes = await this.seedRecipes(admin.id);
    summary.recipes += recipes;

    const inventory = await this.seedInventory(user.id);
    summary.inventory += inventory;

    const nutritionProfiles = await this.seedNutritionProfile(user.id);
    summary.nutritionProfiles += nutritionProfiles;

    return summary;
  }

  private async ensureUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<[User, boolean]> {
    const existing = await this.usersRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      return [existing, false];
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      id: this.generateId(),
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: new Date('1990-01-01'),
      sex: Sex.Hombre,
      weightKg: 70,
      heightCm: 170,
      activityLevel: ActivityLevel.Moderado,
      goal: NutritionGoal.Mantener,
      role: data.role,
      isActive: true,
    });

    const saved = await this.usersRepo.save(user);
    return [saved, true];
  }

  private async seedProducts(): Promise<number> {
    type SeedProduct = {
      name: string;
      category: ProductCategory;
      unit: string;
      niCalories: number;
      niCarbohydrates: number;
      niProtein: number;
      niFat: number;
    };

    const seedProducts: SeedProduct[] = [
      {
        name: 'Manzana Roja',
        category: 'fruits',
        unit: 'pieces',
        niCalories: 52,
        niCarbohydrates: 14,
        niProtein: 0.3,
        niFat: 0.2,
      },
      {
        name: 'Pechuga de Pollo',
        category: 'proteins',
        unit: 'g',
        niCalories: 165,
        niCarbohydrates: 0,
        niProtein: 31,
        niFat: 3.6,
      },
      {
        name: 'Arroz Integral',
        category: 'grains',
        unit: 'g',
        niCalories: 111,
        niCarbohydrates: 23,
        niProtein: 2.6,
        niFat: 0.9,
      },
      {
        name: 'Yogur Natural',
        category: 'dairy',
        unit: 'g',
        niCalories: 59,
        niCarbohydrates: 3.6,
        niProtein: 10,
        niFat: 0.4,
      },
    ];

    let created = 0;

    for (const product of seedProducts) {
      const existing = await this.productsRepo.findOne({
        where: { name: product.name },
      });

      if (existing) {
        continue;
      }

      const entity = this.productsRepo.create({
        id: this.generateId(),
        ...product,
      } as DeepPartial<Product>);

      await this.productsRepo.save(entity);
      created += 1;
    }

    return created;
  }

  private async seedRecipes(userId: string): Promise<number> {
    type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];
    type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];
    type SeedRecipe = {
      name: string;
      description: string;
      category: RecipeCategory;
      difficulty: RecipeDifficulty;
      servings: number;
      isPublic: boolean;
      niCalories: number;
      niProtein: number;
      niCarbohydrates: number;
      niFat: number;
    };

    const seedRecipes: SeedRecipe[] = [
      {
        name: 'Ensalada de Pollo',
        description: 'Ensalada ligera con pollo y vegetales frescos.',
        category: 'lunch',
        difficulty: 'easy',
        servings: 2,
        isPublic: true,
        niCalories: 320,
        niProtein: 35,
        niCarbohydrates: 12,
        niFat: 12,
      },
      {
        name: 'Bowl de Arroz Integral',
        description: 'Bowl con arroz, vegetales y yogurt natural.',
        category: 'dinner',
        difficulty: 'easy',
        servings: 2,
        isPublic: true,
        niCalories: 410,
        niProtein: 18,
        niCarbohydrates: 62,
        niFat: 8,
      },
    ];

    let created = 0;

    for (const recipe of seedRecipes) {
      const existing = await this.recipesRepo.findOne({
        where: { name: recipe.name },
      });

      if (existing) {
        continue;
      }

      const entity = this.recipesRepo.create({
        id: this.generateId(),
        userId,
        parentRecipeId: null,
        isCustom: false,
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        difficulty: recipe.difficulty,
        preparationTime: 15,
        cookingTime: 10,
        servings: recipe.servings,
        imageUrl: null,
        rating: 0,
        ratingCount: 0,
        isPublic: recipe.isPublic,
        niCalories: recipe.niCalories,
        niProtein: recipe.niProtein,
        niCarbohydrates: recipe.niCarbohydrates,
        niFat: recipe.niFat,
        niFiber: 4,
        niSugars: 6,
        niSodium: 320,
        niServingSize: '1 plato',
        niServingsPerRecipe: recipe.servings,
      } as DeepPartial<Recipe>);

      await this.recipesRepo.save(entity);
      created += 1;
    }

    return created;
  }

  private async seedInventory(userId: string): Promise<number> {
    const seedInventory = [
      {
        productName: 'Manzana Roja',
        category: 'fruits',
        unit: 'pieces',
        quantity: 6,
      },
      {
        productName: 'Pechuga de Pollo',
        category: 'proteins',
        unit: 'g',
        quantity: 500,
      },
    ];

    let created = 0;

    for (const item of seedInventory) {
      const existing = await this.inventoryRepo.findOne({
        where: { userId, productName: item.productName },
      });

      if (existing) {
        continue;
      }

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      const entity = this.inventoryRepo.create({
        id: this.generateId(),
        userId,
        productId: null,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        expirationDate,
        category: item.category,
        alertSent: false,
      });

      await this.inventoryRepo.save(entity);
      created += 1;
    }

    return created;
  }

  private async seedNutritionProfile(userId: string): Promise<number> {
    const existing = await this.nutritionRepo.findOne({
      where: { userId },
    });

    if (existing) {
      return 0;
    }

    const profile = this.nutritionRepo.create({
      id: this.generateId(),
      userId,
      dietType: DietType.Sin_dieta,
      excludedIngredients: ['mani'],
      excludedCategories: [],
      maxDailyCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 70,
    });

    await this.nutritionRepo.save(profile);
    return 1;
  }
}
