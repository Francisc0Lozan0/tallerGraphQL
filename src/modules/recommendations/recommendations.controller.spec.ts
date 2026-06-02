import { Test } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;
  let service: jest.Mocked<RecommendationsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        {
          provide: RecommendationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            getTopRated: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(RecommendationsController);
    service = moduleRef.get(RecommendationsService);
  });

  it('getTopRated delegates to service', async () => {
    service.getTopRated.mockResolvedValue([{ id: 'r1' }] as any);

    await expect(controller.getTopRated(5)).resolves.toEqual([{ id: 'r1' }]);
    expect(service.getTopRated).toHaveBeenCalledWith(5);
  });

  it('create delegates to service', async () => {
    service.create.mockResolvedValue({ id: 'r1' } as any);

    await expect(
      controller.create(
        { user: { id: 'user-1' } } as any,
        { recipeId: 'recipe-1', rating: 5 } as any,
      ),
    ).resolves.toEqual({ id: 'r1' });
    expect(service.create).toHaveBeenCalledWith('user-1', {
      recipeId: 'recipe-1',
      rating: 5,
    });
  });
});