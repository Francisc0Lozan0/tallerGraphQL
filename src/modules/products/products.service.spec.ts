import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: jest.Mocked<Repository<Product>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn((v) => v),
            save: jest.fn(async (v) => v),
            find: jest.fn(async () => []),
            findOneBy: jest.fn(async () => null),
            remove: jest.fn(async (v) => v),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
    repo = moduleRef.get(getRepositoryToken(Product));
  });

  it('crea un producto si no existe', async () => {
    repo.findOneBy.mockResolvedValueOnce(null);

    const created = await service.create({
      name: 'Yogur',
      category: 'dairy' as any,
      unit: 'g',
    });

    expect(repo.save).toHaveBeenCalled();
    expect((created as any).id).toEqual(expect.any(String));
  });

  it('lanza ConflictException si nombre ya existe', async () => {
    repo.findOneBy.mockResolvedValueOnce({ id: 'p1' } as any);

    await expect(
      service.create({ name: 'Yogur', category: 'dairy' as any, unit: 'g' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lanza NotFoundException en findOne si no existe', async () => {
    repo.findOneBy.mockResolvedValueOnce(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
