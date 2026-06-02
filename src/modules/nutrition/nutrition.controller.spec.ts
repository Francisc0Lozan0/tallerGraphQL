import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';

describe('NutritionController', () => {
  let controller: NutritionController;
  let service: jest.Mocked<NutritionService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [NutritionController],
      providers: [
        {
          provide: NutritionService,
          useValue: {
            getMyProfile: jest.fn(),
            upsertMyProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(NutritionController);
    service = moduleRef.get(NutritionService);
  });

  it('getMyProfile delegates to service', async () => {
    service.getMyProfile.mockResolvedValue({ id: 'profile-1' } as any);

    await expect(
      controller.getMyProfile({ user: { id: 'user-1' } } as any),
    ).resolves.toEqual({ id: 'profile-1' });
    expect(service.getMyProfile).toHaveBeenCalledWith('user-1');
  });

  it('upsertMyProfile delegates to service', async () => {
    service.upsertMyProfile.mockResolvedValue({ id: 'profile-1' } as any);

    await expect(
      controller.upsertMyProfile(
        { user: { id: 'user-1' } } as any,
        { dietType: 'vegan' } as any,
      ),
    ).resolves.toEqual({ id: 'profile-1' });
    expect(service.upsertMyProfile).toHaveBeenCalledWith('user-1', {
      dietType: 'vegan',
    });
  });

  it('throws when request user is missing', () => {
    expect(() => controller.getMyProfile({} as any)).toThrow(
      UnauthorizedException,
    );
  });
});