import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByBarcode: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(ProductsController);
    service = moduleRef.get(ProductsService);
  });

  it('findByBarcode delega en el service', async () => {
    service.findByBarcode.mockResolvedValue({ id: 'p1' } as any);
    await expect(controller.findByBarcode('123')).resolves.toEqual({ id: 'p1' });
    expect(service.findByBarcode).toHaveBeenCalledWith('123');
  });
});
