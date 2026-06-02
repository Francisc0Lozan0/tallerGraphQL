import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { NutritionTracker } from '../nutrition/entities/nutrition-tracker.entity';
import { NutritionProfile } from '../nutrition/entities/nutritionProfile.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecommendationFeedback } from './entities/recommendation-feedback.entity';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let repo: jest.Mocked<Repository<RecommendationFeedback>>;
  let inventoryRepo: jest.Mocked<Repository<InventoryItem>>;
  let recipeRepo: jest.Mocked<Repository<Recipe>>;
  let profileRepo: jest.Mocked<Repository<NutritionProfile>>;
  let trackerRepo: jest.Mocked<Repository<NutritionTracker>>;

  beforeEach(async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: getRepositoryToken(RecommendationFeedback),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => value),
            find: jest.fn(async () => []),
            findOneBy: jest.fn(async () => null),
            remove: jest.fn(async (value) => value),
          },
        },
        {
          provide: getRepositoryToken(Recipe),
          useValue: {
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: {
            find: jest.fn(async () => []),
          },
        },
        {
          provide: getRepositoryToken(NutritionProfile),
          useValue: {
            findOneBy: jest.fn(async () => null),
          },
        },
        {
          provide: getRepositoryToken(NutritionTracker),
          useValue: {
            findOneBy: jest.fn(async () => null),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(RecommendationsService);
    repo = moduleRef.get(getRepositoryToken(RecommendationFeedback));
    inventoryRepo = moduleRef.get(getRepositoryToken(InventoryItem));
    recipeRepo = moduleRef.get(getRepositoryToken(Recipe));
    profileRepo = moduleRef.get(getRepositoryToken(NutritionProfile));
    trackerRepo = moduleRef.get(getRepositoryToken(NutritionTracker));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates feedback with prepared default', async () => {
    const result = await service.create('user-1', {
      recipeId: 'recipe-1',
      rating: 5,
    } as any);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        recipeId: 'recipe-1',
        rating: 5,
        prepared: false,
      }),
    );
    expect(result).toEqual(expect.objectContaining({ recipeId: 'recipe-1' }));
  });

  it('updates duplicated feedback for the same user and recipe', async () => {
    repo.findOneBy.mockResolvedValueOnce({ id: 'rf-1' } as any);
    repo.save.mockResolvedValueOnce({ id: 'rf-1', rating: 4 } as any);

    await expect(
      service.create('user-1', { recipeId: 'recipe-1', rating: 5 } as any),
    ).resolves.toEqual(expect.objectContaining({ id: 'rf-1' }));

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rf-1',
        rating: 5,
      }),
    );
  });

  it('throws when feedback does not exist', async () => {
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns top rated feedback with sane limit', async () => {
    await service.getTopRated(0);

    expect(repo.find).toHaveBeenCalledWith({
      order: { rating: 'DESC' },
      take: 1,
    });
  });

  it('returns internal recommendations based on inventory and recipe matches', async () => {
    inventoryRepo.find.mockResolvedValue([
      {
        productId: 'prod-1',
        productName: 'Tomate',
        expirationDate: new Date('2026-05-20T00:00:00Z'),
      },
    ] as any);
    profileRepo.findOneBy.mockResolvedValue(null as any);
    trackerRepo.findOneBy.mockResolvedValue(null as any);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const queryBuilder = recipeRepo.createQueryBuilder('recipe') as any;
    queryBuilder.getMany.mockResolvedValue([
      {
        id: 'recipe-1',
        rating: 4,
        niCalories: 250,
        ingredients: [
          {
            productId: 'prod-1',
            optional: false,
          },
        ],
      },
    ]);

    const result = await service.getRecommendations('user-1', false, '2026-05-13', 5);

    expect(recipeRepo.createQueryBuilder).toHaveBeenCalledWith('recipe');
    expect(inventoryRepo.find).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        score: 41,
        matchedIngredientsCount: 1,
        totalIngredientsCount: 1,
      }),
    );

    jest.restoreAllMocks();
  });
});
