import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { Recipe } from './entities/recipe.entity';
import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  let service: RecipesService;
  let repo: jest.Mocked<Repository<Recipe>>;

  beforeEach(async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(async () => null),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: InventoryService,
          useValue: {
            consumeByProductId: jest.fn(async () => ({ consumed: 0, unit: 'g', productId: 'p1' })),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createRecipeConsumptionNotification: jest.fn(async () => null),
          },
        },
        {
          provide: NutritionService,
          useValue: {
            addMacroConsumptionByDate: jest.fn(async () => null),
          },
        },
        {
          provide: getRepositoryToken(Recipe),
          useValue: {
            create: jest.fn((v) => v),
            save: jest.fn(async (v) => v),
            find: jest.fn(async () => []),
            findOneBy: jest.fn(async () => null),
            remove: jest.fn(async (v) => v),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(RecipesService);
    repo = moduleRef.get(getRepositoryToken(Recipe));
  });

  it('crea una receta con rating inicial', async () => {
    const created = await service.create({
      name: 'Ensalada',
      category: 'salads' as any,
      difficulty: 'easy' as any,
    });

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 0, ratingCount: 0, isCustom: true }),
    );
    expect((created as any).id).toEqual(expect.any(String));
  });

  it('rate recalcula promedio', async () => {
    const queryBuilder = repo.createQueryBuilder('recipe') as any;
    queryBuilder.getOne.mockResolvedValueOnce({
      id: 'r1',
      name: 'Ensalada',
      rating: 4,
      ratingCount: 1,
      ingredients: [],
    } as any);

    const saved = await service.rate('r1', 2);

    expect(saved).toEqual(expect.objectContaining({ rating: 3, ratingCount: 2 }));
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 3, ratingCount: 2 }),
    );
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    const queryBuilder = repo.createQueryBuilder('recipe') as any;
    queryBuilder.getOne.mockResolvedValueOnce(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
