import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItem } from './entities/inventory-item.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InventoryService {
  private readonly lowStockThreshold = 3;

  constructor(
    @InjectRepository(InventoryItem)
    private repo: Repository<InventoryItem>,
    private notificationsService: NotificationsService,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  async create(createInventoryItemDto: CreateInventoryItemDto) {
    const quantityToAdd = Number(createInventoryItemDto.quantity ?? 0);

    if (createInventoryItemDto.productId) {
      const existingItem = await this.repo.findOne({
        where: {
          userId: createInventoryItemDto.userId,
          productId: createInventoryItemDto.productId,
          unit: createInventoryItemDto.unit,
        },
      });

      if (existingItem) {
        const previousQuantity = Number(existingItem.quantity ?? 0);
        existingItem.quantity = Number(existingItem.quantity ?? 0) + quantityToAdd;

        if (createInventoryItemDto.expirationDate) {
          const existingExpiration = new Date(existingItem.expirationDate).getTime();
          const incomingExpiration = new Date(createInventoryItemDto.expirationDate).getTime();
          if (Number.isFinite(incomingExpiration) && incomingExpiration < existingExpiration) {
            existingItem.expirationDate = new Date(createInventoryItemDto.expirationDate);
          }
        }

        if (createInventoryItemDto.notes) {
          existingItem.notes = createInventoryItemDto.notes;
        }

        const savedItem = await this.repo.save(existingItem);
        await this.notificationsService.createStockNotification(savedItem, {
          previousQuantity,
          lowStockThreshold: this.lowStockThreshold,
        });
        await this.notificationsService.syncInventoryNotifications(createInventoryItemDto.userId!);
        return savedItem;
      }
    }

    const item = this.repo.create({
      id: this.generateId(),
      ...createInventoryItemDto,
      quantity: quantityToAdd,
      alertSent: false,
    });

    const savedItem = await this.repo.save(item);
    await this.notificationsService.createStockNotification(savedItem, {
      previousQuantity: null,
      lowStockThreshold: this.lowStockThreshold,
    });
    await this.notificationsService.syncInventoryNotifications(createInventoryItemDto.userId!);
    return savedItem;
  }

  async findAll(userId: string, filters?: { q?: string; category?: string }) {
    const where: any = { userId };

    if (filters?.q) {
      where.productName = ILike(`%${filters.q}%`);
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    return this.repo.find({
      where,
      order: { productName: 'ASC' },
      relations: ['product'],
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.repo.findOne({
      where: { id, userId },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async update(
    id: string,
    userId: string,
    updateInventoryItemDto: UpdateInventoryItemDto,
  ) {
    const item = await this.findOne(id, userId);
    const previousQuantity = Number(item.quantity ?? 0);
    const { userId: _ignoredUserId, ...safeUpdateDto } = updateInventoryItemDto as any;

    Object.assign(item, safeUpdateDto);

    const savedItem = await this.repo.save(item);
    await this.notificationsService.createStockNotification(savedItem, {
      previousQuantity,
      lowStockThreshold: this.lowStockThreshold,
    });
    await this.notificationsService.syncInventoryNotifications(userId);
    return savedItem;
  }

  async remove(id: string, userId: string) {
    const item = await this.findOne(id, userId);
    return this.repo.remove(item);
  }

  async consumeByProductId(
    userId: string,
    productId: string,
    quantity: number,
    unit: string,
  ) {
    if (quantity <= 0) {
      return { consumed: 0, unit, productId };
    }

    const items = await this.repo.find({
      where: { userId, productId, unit },
      order: { expirationDate: 'ASC' },
    });
    const changedItems: Array<{ item: InventoryItem; previousQuantity: number }> = [];

    const totalAvailable = items.reduce(
      (acc, item) => acc + Number(item.quantity ?? 0),
      0,
    );

    if (totalAvailable < quantity) {
      throw new BadRequestException(
        `No hay suficiente inventario para el producto ${productId}. Disponible: ${totalAvailable} ${unit}.`,
      );
    }

    let remaining = quantity;
    for (const item of items) {
      if (remaining <= 0) break;
      const available = Number(item.quantity ?? 0);
      const previousQuantity = available;
      const newQuantity = available - remaining;

      if (newQuantity <= 0) {
        item.quantity = 0;
        remaining -= available;
      } else {
        item.quantity = newQuantity;
        remaining = 0;
      }

      changedItems.push({ item, previousQuantity });
    }

    await this.repo.save(items);

    for (const { item, previousQuantity } of changedItems) {
      await this.notificationsService.createStockNotification(item, {
        previousQuantity,
        lowStockThreshold: this.lowStockThreshold,
      });
    }

    return { consumed: quantity, unit, productId };
  }

  async consumeItems(
    userId: string,
    items: Array<{ id: string; quantity: number }>,
  ) {
    if (!items?.length) {
      throw new BadRequestException('Debe enviar items a consumir');
    }

    const updated: InventoryItem[] = [];
    const removed: InventoryItem[] = [];

    for (const itemToConsume of items) {
      const item = await this.repo.findOne({
        where: { id: itemToConsume.id, userId },
      });

      if (!item) {
        throw new NotFoundException(
          `Inventory item not found: ${itemToConsume.id}`,
        );
      }

      const previousQuantity = Number(item.quantity ?? 0);
      const newQuantity = previousQuantity - Number(itemToConsume.quantity ?? 0);

      if (newQuantity <= 0) {
        await this.repo.remove(item);
        removed.push(item);
        continue;
      }

      item.quantity = newQuantity;
      const savedItem = await this.repo.save(item);
      updated.push(savedItem);

      await this.notificationsService.createStockNotification(savedItem, {
        previousQuantity,
        lowStockThreshold: this.lowStockThreshold,
      });
    }

    await this.notificationsService.syncInventoryNotifications(userId);

    return { updated, removed };
  }

  

  async stats(userId: string) {
    await this.notificationsService.syncInventoryNotifications(userId);

    const items = await this.repo.find({ where: { userId } });

    const totalItems = items.length;

    const expiringSoon = items.filter((item) => {
      const diff =
        new Date(item.expirationDate).getTime() - new Date().getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days <= 7 && days >= 0;
    }).length;

    const expired = items.filter(
      (item) => new Date(item.expirationDate) < new Date(),
    ).length;

    return {
      totalItems,
      expiringSoon,
      expired,
    };
  }
}