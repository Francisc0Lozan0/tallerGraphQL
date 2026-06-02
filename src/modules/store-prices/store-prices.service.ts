import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { Store } from './entities/store.entity';
import { StorePrice } from './entities/store-price.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateStorePriceDto } from './dto/create-store-price.dto';
import { UpdateStorePriceDto } from './dto/update-store-price.dto';
import { GetStoresPricesDto } from './dto/get-stores-prices.dto';

@Injectable()
export class StorePricesService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StorePrice)
    private storePriceRepository: Repository<StorePrice>,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  /**
   * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ============ FUNCIONES DE TIENDAS ============

  /**
   * Crear una nueva tienda
   */
  async createStore(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create({
      id: this.generateId(),
      ...createStoreDto,
    });

    return this.storeRepository.save(store);
  }

  /**
   * Obtener todas las tiendas
   */
  async getAllStores(): Promise<Store[]> {
    return this.storeRepository.find({
      where: { isActive: true },
    });
  }

  /**
   * Obtener una tienda por ID
   */
  async getStoreById(id: string): Promise<Store> {
    const store = await this.storeRepository.findOneBy({ id });

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${id} no encontrada.`);
    }

    return store;
  }

  /**
   * Actualizar una tienda
   */
  async updateStore(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.getStoreById(id);

    Object.assign(store, updateStoreDto);

    return this.storeRepository.save(store);
  }

  /**
   * Eliminar una tienda (soft delete)
   */
  async deleteStore(id: string): Promise<void> {
    const store = await this.getStoreById(id);

    store.isActive = false;

    await this.storeRepository.save(store);
  }

  /**
   * Obtener tiendas cercanas a una ubicación
   */
  async getNearbyStores(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<(Store & { distance: number })[]> {
    if (!latitude || !longitude) {
      throw new BadRequestException('Latitud y longitud son requeridas.');
    }

    if (radiusKm <= 0) {
      throw new BadRequestException('El radio debe ser mayor a 0.');
    }

    const stores = await this.storeRepository.find({
      where: { isActive: true },
    });

    const nearbyStores = stores
      .map((store) => ({
        ...store,
        distance: this.calculateDistance(
          latitude,
          longitude,
          Number(store.latitude),
          Number(store.longitude),
        ),
      }))
      .filter((store) => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyStores;
  }

  // ============ FUNCIONES DE PRECIOS ============

  /**
   * Crear un nuevo precio para un producto en una tienda
   */
  async createStorePrice(createStorePriceDto: CreateStorePriceDto): Promise<StorePrice> {
    // Verificar que la tienda existe
    await this.getStoreById(createStorePriceDto.storeId);

    // Verificar que el precio no existe ya
    const existingPrice = await this.storePriceRepository.findOneBy({
      storeId: createStorePriceDto.storeId,
      productId: createStorePriceDto.productId,
    });

    if (existingPrice) {
      throw new ConflictException(
        `Ya existe un precio para este producto en esta tienda.`,
      );
    }

    const storePrice = this.storePriceRepository.create({
      id: this.generateId(),
      ...createStorePriceDto,
    });

    return this.storePriceRepository.save(storePrice);
  }

  /**
   * Obtener todos los precios de un producto
   */
  async getPricesByProduct(productId: string): Promise<StorePrice[]> {
    return this.storePriceRepository.find({
      where: {
        productId,
        isAvailable: true,
      },
      relations: ['store', 'product'],
      order: {
        price: 'ASC',
      },
    });
  }

  /**
   * Obtener precios de una tienda
   */
  async getPricesByStore(storeId: string): Promise<StorePrice[]> {
    // Verificar que la tienda existe
    await this.getStoreById(storeId);

    return this.storePriceRepository.find({
      where: { storeId },
      relations: ['product'],
    });
  }

  /**
   * Obtener precio específico de un producto en una tienda
   */
  async getStoreProductPrice(storeId: string, productId: string): Promise<StorePrice> {
    const price = await this.storePriceRepository.findOneBy({
      storeId,
      productId,
    });

    if (!price) {
      throw new NotFoundException(
        `Precio no encontrado para el producto en esta tienda.`,
      );
    }

    return price;
  }

  /**
   * Actualizar el precio de un producto en una tienda
   */
  async updateStorePrice(
    storeId: string,
    productId: string,
    updateStorePriceDto: UpdateStorePriceDto,
  ): Promise<StorePrice> {
    const storePrice = await this.getStoreProductPrice(storeId, productId);

    Object.assign(storePrice, updateStorePriceDto);

    return this.storePriceRepository.save(storePrice);
  }

  /**
   * Eliminar el precio de un producto en una tienda
   */
  async deleteStorePrice(storeId: string, productId: string): Promise<void> {
    const storePrice = await this.getStoreProductPrice(storeId, productId);

    await this.storePriceRepository.remove(storePrice);
  }

  /**
   * Obtener precios de múltiples productos en tiendas cercanas
   * Útil para encontrar dónde comprar los ingredientes más baratos
   */
  async getNearbyStoresPrices(query: GetStoresPricesDto): Promise<
    Array<{
      store: Store & { distance: number };
      prices: StorePrice[];
      totalCost?: number;
    }>
  > {
    const { latitude, longitude, radiusKm = 5, productIds, limit = 10 } = query;

    // Obtener tiendas cercanas
    const nearbyStores = await this.getNearbyStores(latitude, longitude, radiusKm);

    if (nearbyStores.length === 0) {
      return [];
    }

    // Limitar tiendas
    const limitedStores = nearbyStores.slice(0, limit);

    // Obtener precios para todas las tiendas
    const result: Array<{
      store: Store & { distance: number };
      prices: StorePrice[];
      totalCost?: number;
    }> = [];

    for (const store of limitedStores) {
      let priceQuery = this.storePriceRepository
        .createQueryBuilder('sp')
        .where('sp.storeId = :storeId', { storeId: store.id })
        .leftJoinAndSelect('sp.product', 'product')
        .orderBy('sp.price', 'ASC');

      if (productIds && productIds.length > 0) {
        priceQuery = priceQuery.andWhere('sp.productId IN (:...productIds)', {
          productIds,
        });
      }

      const prices = await priceQuery.getMany();

      const storeWithPrices: {
        store: Store & { distance: number };
        prices: StorePrice[];
        totalCost?: number;
      } = {
        store: {
          ...store,
          distance: store.distance,
        },
        prices,
      };

      // Calcular costo total si se especificaron productos
      if (productIds && productIds.length > 0) {
        const totalCost = prices.reduce((sum, price) => sum + Number(price.price), 0);
        storeWithPrices.totalCost = totalCost;
      }

      result.push(storeWithPrices);
    }

    // Ordenar por costo total si se especificaron productos
    if (productIds && productIds.length > 0) {
      result.sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0));
    }

    return result;
  }

  /**
   * Obtener el precio más barato para un producto en tiendas cercanas
   */
  async getCheapestStoreForProduct(
    productId: string,
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<{
    store: Store & { distance: number };
    price: StorePrice;
  } | null> {
    const nearbyStores = await this.getNearbyStores(latitude, longitude, radiusKm);

    if (nearbyStores.length === 0) {
      return null;
    }

    const storeIds = nearbyStores.map((s) => s.id);

    const cheapestPrice = await this.storePriceRepository
      .createQueryBuilder('sp')
      .where('sp.productId = :productId', { productId })
      .andWhere('sp.storeId IN (:...storeIds)', { storeIds })
      .andWhere('sp.isAvailable = :isAvailable', { isAvailable: true })
      .leftJoinAndSelect('sp.store', 'store')
      .orderBy('sp.price', 'ASC')
      .limit(1)
      .getOne();

    if (!cheapestPrice) {
      return null;
    }

    const storeWithDistance = nearbyStores.find(
      (s) => s.id === cheapestPrice.storeId,
    );

    if (!storeWithDistance) {
      return null;
    }

    return {
      store: storeWithDistance,
      price: cheapestPrice,
    };
  }

  /**
   * Obtener los precios más baratos para múltiples productos
   */
  async getCheapestStoresForProducts(
    productIds: string[],
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<
    Map<
      string,
      {
        store: Store & { distance: number };
        price: StorePrice;
      } | null
    >
  > {
    const result = new Map();

    for (const productId of productIds) {
      const cheapest = await this.getCheapestStoreForProduct(
        productId,
        latitude,
        longitude,
        radiusKm,
      );
      result.set(productId, cheapest);
    }

    return result;
  }

  /**
   * Buscar productos disponibles en tiendas cercanas
   */
  async searchProductsInNearbyStores(
    productName: string,
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<StorePrice[]> {
    const nearbyStores = await this.getNearbyStores(latitude, longitude, radiusKm);

    if (nearbyStores.length === 0) {
      return [];
    }

    const storeIds = nearbyStores.map((s) => s.id);

    return this.storePriceRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.product', 'product')
      .leftJoinAndSelect('sp.store', 'store')
      .where('sp.storeId IN (:...storeIds)', { storeIds })
      .andWhere('sp.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('LOWER(product.name) LIKE LOWER(:productName)', {
        productName: `%${productName}%`,
      })
      .orderBy('sp.price', 'ASC')
      .getMany();
  }

  /**
   * Obtener estadísticas de precios para un producto
   */
  async getProductPriceStats(productId: string): Promise<{
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    storesCount: number;
  } | null> {
    const prices = await this.storePriceRepository
      .createQueryBuilder('sp')
      .select('COUNT(*)', 'count')
      .addSelect('MIN(sp.price)', 'minPrice')
      .addSelect('MAX(sp.price)', 'maxPrice')
      .addSelect('AVG(sp.price)', 'averagePrice')
      .where('sp.productId = :productId', { productId })
      .andWhere('sp.isAvailable = :isAvailable', { isAvailable: true })
      .getRawOne();

    if (!prices || prices.count === '0') {
      return null;
    }

    return {
      minPrice: Number(prices.minPrice),
      maxPrice: Number(prices.maxPrice),
      averagePrice: Number(prices.averagePrice),
      storesCount: Number(prices.count),
    };
  }

  /**
   * Obtener precios bulk para múltiples productos
   */
  async getBulkPrices(
    storeId: string,
    productIds: string[],
  ): Promise<StorePrice[]> {
    if (productIds.length === 0) {
      return [];
    }

    // Verificar que la tienda existe
    await this.getStoreById(storeId);

    return this.storePriceRepository.find({
      where: {
        storeId,
        productId: In(productIds),
      },
      relations: ['product'],
    });
  }

  /**
   * Actualizar múltiples precios a la vez
   */
  async updateBulkPrices(
    updates: Array<{
      storeId: string;
      productId: string;
      price: number;
      isAvailable?: boolean;
    }>,
  ): Promise<StorePrice[]> {
    const results: StorePrice[] = [];

    for (const update of updates) {
      try {
        const updated = await this.updateStorePrice(update.storeId, update.productId, {
          price: update.price,
          isAvailable: update.isAvailable,
        });
        results.push(updated);
      } catch (error) {
        // Ignorar errores y continuar con el siguiente
        console.error(
          `Error actualizando precio para producto ${update.productId} en tienda ${update.storeId}:`,
          error,
        );
      }
    }

    return results;
  }
}
