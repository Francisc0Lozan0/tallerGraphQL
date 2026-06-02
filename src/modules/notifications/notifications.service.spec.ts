import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { EmailService } from '../auth/services/email.service';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { SmsService } from './sms.service';
import { User } from '../users/entities/user.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: jest.Mocked<Repository<Notification>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let emailService: jest.Mocked<EmailService>;
  let smsService: jest.Mocked<SmsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(async (value) => value),
            find: jest.fn(),
            count: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InventoryItem),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendNotificationEmail: jest.fn(async () => true),
          },
        },
        {
          provide: SmsService,
          useValue: {
            sendNotificationSms: jest.fn(async () => true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
    notificationRepo = moduleRef.get(getRepositoryToken(Notification));
    userRepo = moduleRef.get(getRepositoryToken(User));
    emailService = moduleRef.get(EmailService);
    smsService = moduleRef.get(SmsService);
  });

  it('dispara correo y SMS cuando el usuario lo tiene activo', async () => {
    userRepo.findOne.mockResolvedValueOnce({
      id: 'u1',
      email: 'user@example.com',
      phoneNumber: '+593999999999',
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: true,
    } as User);

    await service.create('u1', {
      type: 'stock_low',
      title: 'Stock bajo',
      message: 'Leche por debajo del mínimo',
    });

    expect(notificationRepo.save).toHaveBeenCalled();
    expect(emailService.sendNotificationEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Stock bajo',
      'Leche por debajo del mínimo',
      expect.stringContaining('/notifications'),
    );
    expect(smsService.sendNotificationSms).toHaveBeenCalledWith(
      '+593999999999',
      'Stock bajo: Leche por debajo del mínimo',
    );
  });

  it('no dispara canales externos si están desactivados', async () => {
    userRepo.findOne.mockResolvedValueOnce({
      id: 'u1',
      email: 'user@example.com',
      phoneNumber: '+593999999999',
      emailNotificationsEnabled: false,
      smsNotificationsEnabled: false,
    } as User);

    await service.create('u1', {
      type: 'recipe_consumption',
      title: 'Ingredientes utilizados',
      message: 'Se descontó arroz',
    });

    expect(emailService.sendNotificationEmail).not.toHaveBeenCalled();
    expect(smsService.sendNotificationSms).not.toHaveBeenCalled();
  });
});