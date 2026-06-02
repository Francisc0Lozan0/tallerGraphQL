import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryService } from './inventory.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let repo: jest.Mocked<Repository<InventoryItem>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: NotificationsService,
          useValue: {
            createStockNotification: jest.fn(async () => null),
            syncInventoryNotifications: jest.fn(async () => []),
          },
        },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: {
            create: jest.fn((v) => v),
            save: jest.fn(async (v) => v),
            find: jest.fn(async () => []),
            findOne: jest.fn(async () => null),
            findOneBy: jest.fn(async () => null),
            remove: jest.fn(async (v) => v),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(InventoryService);
    repo = moduleRef.get(getRepositoryToken(InventoryItem));
  });

  it('crea un item con defaults', async () => {
    const created = await service.create({
      userId: 'u1',
      productName: 'Manzana',
      expirationDate: '2026-05-01T00:00:00.000Z',
    });

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        productName: 'Manzana',
        quantity: 0,
        alertSent: false,
      }),
    );
    expect((created as any).id).toEqual(expect.any(String));
  });

  it('lanza NotFoundException si no existe', async () => {
    await expect(service.findOne('missing', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('actualiza un item existente', async () => {
    const existing = {
      id: 'i1',
      userId: 'u1',
      productName: 'Manzana',
      quantity: 1,
      alertSent: false,
      expirationDate: '2026-05-01T00:00:00.000Z',
    } as any;

    repo.findOne.mockResolvedValue(existing);

    const updated = await service.update('i1', 'u1', { quantity: 3 });

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'i1', quantity: 3 }),
    );
    expect(updated).toEqual(expect.objectContaining({ id: 'i1', quantity: 3 }));
  });

  it('stats calcula totales y vencimientos', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-26T00:00:00.000Z'));

    repo.find.mockResolvedValue([
      {
        id: 'a',
        expirationDate: '2026-04-28T00:00:00.000Z',
      },
      {
        id: 'b',
        expirationDate: '2026-04-10T00:00:00.000Z',
      },
      {
        id: 'c',
        expirationDate: '2026-06-01T00:00:00.000Z',
      },
    ] as any);

    const result = await service.stats('u1');

    expect(result).toEqual({
      totalItems: 3,
      expiringSoon: 1,
      expired: 1,
    });

    jest.useRealTimers();
  });
});
