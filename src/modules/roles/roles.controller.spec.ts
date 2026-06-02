import { Test } from '@nestjs/testing';
import { Role } from '../auth/enums/role.enum';
import { UsersService } from '../users/users.service';
import { RolesController } from './roles.controller';

describe('RolesController', () => {
  let controller: RolesController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(RolesController);
    usersService = moduleRef.get(UsersService);
  });

  it('retorna mensaje si no existe usuario', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      controller.assignRole({ email: 'a@a.com', role: Role.Admin }),
    ).resolves.toEqual({ message: 'User not found' });
  });

  it('asigna rol si existe usuario', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      role: 'user',
    } as any);
    usersService.update.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      role: 'admin',
    } as any);

    const result = await controller.assignRole({
      email: 'a@a.com',
      role: Role.Admin,
    });

    expect(usersService.update).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ role: Role.Admin }),
    );
    expect(result).toEqual(
      expect.objectContaining({ message: 'Role assigned successfully' }),
    );
  });
});
