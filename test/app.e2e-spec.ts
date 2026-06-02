import { INestApplication, ValidationPipe } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { InventoryItem } from '../src/modules/inventory/entities/inventory-item.entity';
import { Recipe } from '../src/modules/recipes/entities/recipe.entity';
import { RecipeIngredient } from '../src/modules/recipes/entities/recipe-ingredient.entity';

describe('API integration (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);

    const adminRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin.e2e@example.com',
        password: 'Admin123!',
        first_name: 'Admin',
        last_name: 'E2E',
        birth_date: '1990-01-01',
        sex: 'hombre',
        weight_kg: 80,
        height_cm: 180,
        activity_level: 'moderado',
        goal: 'mantener',
        diet_type: 'omnivore',
        excluded_ingredients: [],
        excluded_categories: [],
      })
      .expect(201);

    adminToken = adminRegister.body.access_token;
    adminUserId = adminRegister.body.user.id;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user.e2e@example.com',
        password: 'User123!',
        first_name: 'User',
        last_name: 'E2E',
        birth_date: '1998-02-10',
        sex: 'mujer',
        weight_kg: 62,
        height_cm: 165,
        activity_level: 'ligero',
        goal: 'mantener',
        diet_type: 'omnivore',
        excluded_ingredients: [],
        excluded_categories: [],
      })
      .expect(201);

    userToken = userRegister.body.access_token;
    userId = userRegister.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('GET /users/me (auth)', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('user.e2e@example.com');
      });
  });

  it('POST /roles/assign (admin)', () => {
    return request(app.getHttpServer())
      .post('/roles/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user.e2e@example.com', role: 'nutritionist' })
      .expect(201)
      .expect((res) => {
        expect(res.body.user.role).toBe('nutritionist');
      });
  });

  it('POST /products (admin)', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Yogur Natural E2E',
        category: 'dairy',
        unit: 'g',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Yogur Natural E2E');
      });
  });

  it('GET /products', () => {
    return request(app.getHttpServer())
      .get('/products?q=Yogur')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('POST /inventory', () => {
    return request(app.getHttpServer())
      .post('/inventory')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productName: 'Manzana E2E',
        category: 'fruits',
        unit: 'pieces',
        expirationDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.productName).toBe('Manzana E2E');
      });
  });

  it('GET /inventory/stats', () => {
    return request(app.getHttpServer())
      .get('/inventory/stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.totalItems).toBeDefined();
      });
  });

  it('PUT /nutrition/profile', () => {
    return request(app.getHttpServer())
      .put('/nutrition/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ dietType: 'vegan', maxDailyCalories: 2000 })
      .expect(200)
      .expect((res) => {
        expect(res.body.dietType).toBe('vegan');
      });
  });

  it('GET /nutrition/profile', () => {
    return request(app.getHttpServer())
      .get('/nutrition/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.userId).toBe(userId);
      });
  });

  it('GET /recommendations/suggest returns internal recipe recommendations', async () => {
    const productId = randomBytes(12).toString('hex');
    const recipeRepository = dataSource.getRepository(Recipe);
    const inventoryRepository = dataSource.getRepository(InventoryItem);

    const recipe = await recipeRepository.save({
      id: 'r',
      userId: 'u',
      parentRecipeId: null,
      isCustom: true,
      name: 'Tomate con Pasta E2E',
      description: 'Receta de prueba',
      category: 'lunch',
      difficulty: 'easy',
      preparationTime: 10,
      cookingTime: 15,
      servings: 2,
      imageUrl: 'https://example.com/recipe.jpg',
      rating: 0,
      ratingCount: 0,
      isPublic: true,
      isVegetarian: true,
      isVegan: true,
      niCalories: 250,
      niProtein: 12,
      niCarbohydrates: 30,
      niFat: 8,
      niFiber: 4,
      niSugars: 5,
      niSodium: 180,
      niServingSize: '1 plato',
      niServingsPerRecipe: 2,
    } as any);

    await dataSource.getRepository(RecipeIngredient).save({
      id: randomBytes(12).toString('hex'),
      recipeId: recipe.id,
      productId,
      genericName: 'Tomate',
      quantity: 2,
      unit: 'g',
      optional: false,
      recipe,
    } as any);

    await inventoryRepository.save({
      id: randomBytes(12).toString('hex'),
      userId,
      productId,
      productName: 'Tomate',
      quantity: 1,
      unit: 'g',
      purchaseDate: null,
      expirationDate: new Date(Date.now() + 7 * 86400000),
      category: 'vegetables',
      location: null,
      barcode: null,
      notes: null,
      alertSent: false,
    } as any);

    await request(app.getHttpServer())
      .get('/recommendations/suggest?date=2026-05-13&limit=5')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].recipe.id).toBe(recipe.id);
        expect(res.body[0].matchedIngredientsCount).toBe(1);
      });
  });
});
