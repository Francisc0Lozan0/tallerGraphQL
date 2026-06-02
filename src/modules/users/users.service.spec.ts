import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { NutritionService } from '../nutrition/nutrition.service';

describe('UsersService', () => {
  let service: UsersService;
  let moduleRef: any;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: NutritionService,
          useValue: {
            calculateTargetsFromInputs: jest.fn(() => ({
              maxDailyCalories: 2000,
              targetProtein: 150,
              targetCarbs: 250,
              targetFat: 70,
            })),
            setProfileSetupComplete: jest.fn(async () => null),
            upsertMyProfile: jest.fn(async () => null),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(async () => 0),
            findOne: jest.fn(async () => null),
            create: jest.fn((v) => v),
            merge: jest.fn((user, data) => ({ ...user, ...data })),
            save: jest.fn(async (v) => v),
            find: jest.fn(async () => []),
            update: jest.fn(async () => ({ affected: 1 })),
            delete: jest.fn(async () => ({ affected: 1 })),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    repo = moduleRef.get(getRepositoryToken(User));
  });

  it('isEmpty retorna true si count=0', async () => {
    repo.count.mockResolvedValueOnce(0);
    await expect(service.isEmpty()).resolves.toBe(true);
  });

  it('create asigna id de 24 chars', async () => {
    const saved = await service.create({
      email: 'a@a.com',
      passwordHash: 'x',
      firstName: 'A',
      lastName: 'B',
      birthDate: new Date('1995-01-01'),
      sex: 'hombre' as any,
      weightKg: 70,
      heightCm: 175,
      activityLevel: 'moderado' as any,
      goal: 'mantener' as any,
      role: 'user',
    });

    expect((saved as any).id).toEqual(expect.any(String));
    expect((saved as any).id).toHaveLength(24);
    expect(repo.save).toHaveBeenCalled();
  });

  it('delete retorna false si affected=0', async () => {
    repo.delete.mockResolvedValueOnce({ affected: 0 } as any);
    await expect(service.delete('u1')).resolves.toBe(false);
  });

  it('update marca el setup como completo cuando el perfil queda completo', async () => {
    repo.findOne.mockResolvedValueOnce({
      id: 'u1',
      email: 'a@a.com',
      passwordHash: 'x',
      firstName: 'A',
      lastName: 'B',
      birthDate: new Date('1995-01-01'),
      sex: 'hombre' as any,
      weightKg: 70,
      heightCm: 175,
      activityLevel: 'moderado' as any,
      goal: 'mantener' as any,
    } as any);

    await service.update('u1', {
      phoneNumber: '+593999999999',
    } as any);

    const nutritionService = moduleRef.get(NutritionService) as any;
    expect(nutritionService.setProfileSetupComplete).toHaveBeenCalledWith('u1', true);
  });
});
