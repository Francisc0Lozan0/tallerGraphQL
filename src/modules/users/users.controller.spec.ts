import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(UsersController);
    service = moduleRef.get(UsersService);
  });

  it('me devuelve el usuario completo', async () => {
    service.findById.mockResolvedValue({ id: 'u1' } as any);
    await expect(controller.me({ user: { id: 'u1' } } as any)).resolves.toEqual({
      id: 'u1',
    });
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    service.findById.mockResolvedValue(null);
    await expect(controller.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove retorna deleted true si existe', async () => {
    service.delete.mockResolvedValue(true);
    await expect(controller.remove('u1')).resolves.toEqual({ deleted: true });
  });
});
