import { Test } from '@nestjs/testing';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: jest.Mocked<InventoryService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            stats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(InventoryController);
    service = moduleRef.get(InventoryService);
  });

  it('create delega en el service', async () => {
    const dto: CreateInventoryItemDto = {
      productName: 'Manzana',
    };

    service.create.mockResolvedValue({ id: 'i1' } as any);

    await expect(controller.create(dto, { user: { id: 'u1' } } as any)).resolves.toEqual({ id: 'i1' });
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productName: 'Manzana',
        userId: 'u1',
      }),
    );
  });

  it('findAll pasa filtros', async () => {
    service.findAll.mockResolvedValue([] as any);
    await controller.findAll('abc', 'fruit', { user: { id: 'u1' } } as any);
    expect(service.findAll).toHaveBeenCalledWith('u1', {
      q: 'abc',
      category: 'fruit',
    });
  });
});
