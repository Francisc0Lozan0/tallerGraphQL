import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
    service = moduleRef.get(AuthService);
  });

  it('delegates register to service', async () => {
    service.register.mockResolvedValue({ access_token: 'token' } as any);

    await expect(
      controller.register({ email: 'user@example.com' } as any),
    ).resolves.toEqual({ access_token: 'token' });
    expect(service.register).toHaveBeenCalledWith({ email: 'user@example.com' });
  });

  it('throws when bearer token is missing', () => {
    expect(() => controller.logout({ headers: {} } as any)).toThrow(
      UnauthorizedException,
    );
  });

  it('extracts bearer token and logs out', async () => {
    service.logout.mockResolvedValue({ message: 'Logged out successfully' } as any);

    await expect(
      controller.logout({ headers: { authorization: 'Bearer sample-token' } } as any),
    ).resolves.toEqual({ message: 'Logged out successfully' });

    expect(service.logout).toHaveBeenCalledWith('sample-token');
  });
});