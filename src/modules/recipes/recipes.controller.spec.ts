import { Test } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: jest.Mocked<RecipesService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            rate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(RecipesController);
    service = moduleRef.get(RecipesService);
  });

  it('rate delega en el service', async () => {
    service.rate.mockResolvedValue({ id: 'r1', rating: 5 } as any);
    await expect(controller.rate('r1', { rating: 5 } as any)).resolves.toEqual({
      id: 'r1',
      rating: 5,
    });
    expect(service.rate).toHaveBeenCalledWith('r1', 5);
  });
});
