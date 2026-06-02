import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { EmailService } from '../auth/services/email.service';
import { User } from '../users/entities/user.entity';
import { Notification, NotificationType } from './entities/notification.entity';
import { SmsService } from './sms.service';

type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

type ConsumedIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

type StockChangeOptions = {
  lowStockThreshold?: number;
  previousQuantity?: number | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(InventoryItem)
    private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  private getDaysUntilExpiration(expirationDate: Date): number {
    const diff = expirationDate.getTime() - new Date().getTime();
    return diff / (1000 * 60 * 60 * 24);
  }

  async create(userId: string, input: CreateNotificationInput) {
    const notification = this.notificationRepo.create({
      id: this.generateId(),
      userId,
      ...input,
      isRead: false,
    });

    const saved = await this.notificationRepo.save(notification);
    await this.dispatchChannels(saved);
    return saved;
  }

  private async dispatchChannels(notification: Notification) {
    const user = await this.userRepo.findOne({ where: { id: notification.userId } });

    if (!user) {
      return;
    }

    const appLink = process.env.APP_WEB_URL?.trim() || 'http://localhost:3000';
    const notificationLink = `${appLink}/notifications`;

    if (user.emailNotificationsEnabled && user.email) {
      await this.emailService.sendNotificationEmail(
        user.email,
        notification.title,
        notification.message,
        notificationLink,
      );
    }

    if (user.smsNotificationsEnabled && user.phoneNumber) {
      await this.smsService.sendNotificationSms(
        user.phoneNumber,
        `${notification.title}: ${notification.message}`,
      );
    }
  }

  async createExpirationNotification(item: InventoryItem) {
    const daysUntilExpiration = this.getDaysUntilExpiration(item.expirationDate);
    const isExpired = daysUntilExpiration < 0;
    const roundedDays = Math.max(0, Math.ceil(daysUntilExpiration));

    return this.create(item.userId, {
      type: isExpired ? 'expired_item' : 'expiration_warning',
      title: isExpired ? 'Producto vencido' : 'Producto por vencer',
      message: isExpired
        ? `${item.productName} ya venció y debería retirarse del inventario.`
        : `${item.productName} vence en aproximadamente ${roundedDays} día${roundedDays === 1 ? '' : 's'}.`,
      entityType: 'inventory_item',
      entityId: item.id,
      metadata: {
        productId: item.productId ?? null,
        productName: item.productName,
        expirationDate: item.expirationDate,
        quantity: item.quantity,
        unit: item.unit,
        status: isExpired ? 'expired' : 'expiring_soon',
      },
    });
  }

  async createStockNotification(
    item: InventoryItem,
    options: StockChangeOptions = {},
  ) {
    const lowStockThreshold = options.lowStockThreshold ?? 3;
    const currentQuantity = Number(item.quantity ?? 0);
    const previousQuantity = options.previousQuantity;

    const becameDepleted = currentQuantity <= 0 && (previousQuantity ?? Number.POSITIVE_INFINITY) > 0;
    const becameLowStock =
      currentQuantity > 0 &&
      currentQuantity <= lowStockThreshold &&
      (previousQuantity == null || previousQuantity > lowStockThreshold);

    if (!becameDepleted && !becameLowStock) {
      return null;
    }

    return this.create(item.userId, {
      type: becameDepleted ? 'stock_depleted' : 'stock_low',
      title: becameDepleted ? 'Inventario agotado' : 'Stock bajo',
      message: becameDepleted
        ? `Se agotó ${item.productName}.`
        : `${item.productName} está por debajo del stock recomendado (${currentQuantity} ${item.unit}).`,
      entityType: 'inventory_item',
      entityId: item.id,
      metadata: {
        productId: item.productId ?? null,
        productName: item.productName,
        quantity: currentQuantity,
        unit: item.unit,
        lowStockThreshold,
        status: becameDepleted ? 'depleted' : 'low_stock',
      },
    });
  }

  async syncInventoryNotifications(userId: string, thresholdDays = 7) {
    const items = await this.inventoryRepo.find({
      where: { userId },
      order: { expirationDate: 'ASC' },
    });

    const notifications: Notification[] = [];
    const itemsToSave: InventoryItem[] = [];

    for (const item of items) {
      if (item.alertSent) {
        continue;
      }

      const daysUntilExpiration = this.getDaysUntilExpiration(item.expirationDate);
      if (daysUntilExpiration > thresholdDays) {
        continue;
      }

      notifications.push(await this.createExpirationNotification(item));
      item.alertSent = true;
      itemsToSave.push(item);
    }

    if (itemsToSave.length > 0) {
      await this.inventoryRepo.save(itemsToSave);
    }

    return notifications;
  }

  async createRecipeConsumptionNotification(
    userId: string,
    recipe: Recipe,
    consumedIngredients: ConsumedIngredient[],
    servings: number | null,
  ) {
    const summary = consumedIngredients
      .map((item) => `${item.quantity} ${item.unit} de ${item.name}`)
      .join(', ');

    return this.create(userId, {
      type: 'recipe_consumption',
      title: 'Ingredientes utilizados',
      message: servings
        ? `Preparaste ${recipe.name} para ${servings} porción${servings === 1 ? '' : 'es'} y se descontó: ${summary}.`
        : `Preparaste ${recipe.name} y se descontó: ${summary}.`,
      entityType: 'recipe',
      entityId: recipe.id,
      metadata: {
        recipeId: recipe.id,
        recipeName: recipe.name,
        servings,
        consumedIngredients,
      },
    });
  }

  async findAll(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async unreadCount(userId: string) {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOneBy({ id, userId });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada.');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      return this.notificationRepo.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.notificationRepo.find({
      where: { userId, isRead: false },
    });

    for (const notification of notifications) {
      notification.isRead = true;
    }

    if (notifications.length > 0) {
      await this.notificationRepo.save(notifications);
    }

    return {
      updated: notifications.length,
    };
  }
}