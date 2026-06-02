import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { RevokedToken } from './entities/revoked-token.entity';
import { EmailService } from './services/email.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { UsersService } from '../users/users.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let repo: jest.Mocked<Repository<RevokedToken>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            isEmpty: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetCode: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
            sendWelcomeEmail: jest.fn(),
            sendNotificationEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: NutritionService,
          useValue: {
            calculateTargetsFromInputs: jest.fn(),
            upsertMyProfile: jest.fn(),
            setProfileSetupComplete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RevokedToken),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => value),
            findOneBy: jest.fn(async () => null),
            findOne: jest.fn(async () => null),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);
    repo = moduleRef.get(getRepositoryToken(RevokedToken));

    jest.clearAllMocks();
  });

  it('register creates first user as admin', async () => {
    usersService.isEmpty.mockResolvedValue(true);
    usersService.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    usersService.create.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
    } as any);
    jwtService.sign.mockReturnValue('access-token');

    const result = await service.register({
      email: 'user@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'admin',
        passwordHash: 'hashed-password',
      }),
    );
    expect(result).toEqual({
      access_token: 'access-token',
      user: {
        id: 'u1',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'admin',
      },
    });
  });

  it('register rejects duplicated email', async () => {
    usersService.isEmpty.mockResolvedValue(false);
    usersService.findByEmail.mockResolvedValue({ id: 'u1' } as any);

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('login rejects invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'user@example.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logout stores revoked token when needed', async () => {
    jwtService.decode.mockReturnValue({ exp: 1_900_000_000 });

    const result = await service.logout('sample-token');

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ tokenHash: expect.any(String) }),
    );
    expect(result).toEqual({ message: 'Logged out successfully' });
  });

  it('isTokenRevoked uses active revocation lookup', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 't1' } as any);

    await expect(service.isTokenRevoked('sample-token')).resolves.toBe(true);
  });
});