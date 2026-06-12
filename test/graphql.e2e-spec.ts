import { INestApplication, ValidationPipe } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('GraphQL API integration (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let productId: string;

  const graphql = async <T = any>(query: string, variables?: Record<string, unknown>, token?: string) => {
    const requestBuilder = request(app.getHttpServer()).post('/graphql');

    if (token) {
      requestBuilder.set('Authorization', `Bearer ${token}`);
    }

    const response = await requestBuilder.send({ query, variables }).expect(200);

    return response.body as { data?: T; errors?: Array<{ message: string }> };
  };

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
        email: 'admin.graphql@example.com',
        password: 'Admin123!',
        first_name: 'Admin',
        last_name: 'GraphQL',
        birth_date: '1990-01-01',
        sex: 'hombre',
        weight_kg: 80,
        height_cm: 180,
        activity_level: 'moderado',
        goal: 'mantener',
        diet_type: 'sin_dieta',
        excluded_ingredients: [],
        excluded_categories: [],
      })
      .expect(201);

    adminToken = adminRegister.body.access_token;

    const userRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user.graphql@example.com',
        password: 'User123!',
        first_name: 'User',
        last_name: 'GraphQL',
        birth_date: '1998-02-10',
        sex: 'mujer',
        weight_kg: 62,
        height_cm: 165,
        activity_level: 'ligero',
        goal: 'mantener',
        diet_type: 'sin_dieta',
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

 

  it('creates a product and an inventory item with resolved relations', async () => {
    const productResult = await graphql<{
      createProduct: { id: string; name: string; unit: string };
    }>(
      `mutation CreateProduct($input: CreateProductDto!) {
        createProduct(input: $input) {
          id
          name
          unit
        }
      }`,
      {
        input: {
          name: 'Yogur GraphQL E2E',
          category: 'dairy',
          unit: 'g',
        },
      },
      adminToken,
    );

    expect(productResult.errors).toBeUndefined();
    productId = productResult.data!.createProduct.id;

    const inventoryResult = await graphql<{
      createInventoryItem: {
        id: string;
        productName: string;
        quantity: number;
        product: { id: string; name: string } | null;
        user: { id: string; email: string } | null;
      };
    }>(
      `mutation CreateInventoryItem($input: CreateInventoryItemDto!) {
        createInventoryItem(input: $input) {
          id
          productName
          quantity
          product {
            id
            name
          }
          user {
            id
            email
          }
        }
      }`,
      {
        input: {
          productName: 'Yogur GraphQL E2E',
          productId,
          category: 'dairy',
          quantity: 3,
          unit: 'g',
          expirationDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        },
      },
      userToken,
    );

    expect(inventoryResult.errors).toBeUndefined();
    expect(inventoryResult.data?.createInventoryItem.product?.id).toBe(productId);
    expect(inventoryResult.data?.createInventoryItem.user?.id).toBe(userId);
  });

  it('returns a GraphQL error for a missing inventory item', async () => {
    const result = await graphql(
      `query InventoryItem($id: String!) {
        inventoryItem(id: $id) {
          id
        }
      }`,
      { id: 'missing-inventory-item' },
      userToken,
    );

    expect(result.data?.inventoryItem).toBeUndefined();
    expect(result.errors?.[0].message).toContain('Inventory item not found');
  });
});
