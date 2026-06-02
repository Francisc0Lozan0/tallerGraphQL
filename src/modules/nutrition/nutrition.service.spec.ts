import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { NutritionTracker } from './entities/nutrition-tracker.entity';
import { DietType, NutritionProfile } from './entities/nutritionProfile.entity';
import { NutritionService } from './nutrition.service';

describe('NutritionService', () => {
  let service: NutritionService;
  let repo: jest.Mocked<Repository<NutritionProfile>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NutritionService,
        {
          provide: getRepositoryToken(NutritionProfile),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => value),
            findOneBy: jest.fn(async () => null),
          },
        },
        {
          provide: getRepositoryToken(NutritionTracker),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => value),
            findOneBy: jest.fn(async () => null),
            update: jest.fn(async () => ({ affected: 1 })),
          },
        },
        {
          provide: getRepositoryToken(NutritionGoal),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => value),
            findOneBy: jest.fn(async () => null),
            update: jest.fn(async () => ({ affected: 1 })),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(NutritionService);
    repo = moduleRef.get(getRepositoryToken(NutritionProfile));
  });

  it('creates default profile when none exists', async () => {
    const result = await service.getMyProfile('user-1');

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        dietType: DietType.Sin_dieta,
      }),
    );
    expect(result).toEqual(expect.objectContaining({ userId: 'user-1' }));
  });

  it('upserts profile preserving existing values', async () => {
    repo.findOneBy.mockResolvedValueOnce({
      id: 'profile-1',
      userId: 'user-1',
      dietType: DietType.Vegetarian,
      excludedIngredients: ['mani'],
      excludedCategories: ['lacteos'],
      maxDailyCalories: 2200,
      targetProtein: 140,
      targetCarbs: 220,
      targetFat: 70,
    } as any);

    const result = await service.upsertMyProfile('user-1', {
      excludedIngredients: ['pescado'],
      maxDailyCalories: 2000,
    } as any);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        excludedIngredients: ['pescado'],
        excludedCategories: ['lacteos'],
        maxDailyCalories: 2000,
        dietType: DietType.Vegetarian,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        excludedIngredients: ['pescado'],
        maxDailyCalories: 2000,
      }),
    );
  });
});