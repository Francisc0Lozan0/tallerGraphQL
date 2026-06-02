import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StorePricesService } from './store-prices.service';
import { Store } from './entities/store.entity';
import { StorePrice } from './entities/store-price.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateStorePriceDto } from './dto/create-store-price.dto';
import { UpdateStorePriceDto } from './dto/update-store-price.dto';
import { GetStoresPricesDto } from './dto/get-stores-prices.dto';

@Controller('store-prices')
export class StorePricesController {
  constructor(private readonly storePricesService: StorePricesService) {}

  // ============ ENDPOINTS DE TIENDAS ============

  /**
   * POST /store-prices/stores
   * Crear una nueva tienda
   */
  @Post('stores')
  @HttpCode(HttpStatus.CREATED)
  createStore(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storePricesService.createStore(createStoreDto);
  }

  /**
   * GET /store-prices/stores
   * Obtener todas las tiendas activas
   */
  @Get('stores')
  getAllStores(): Promise<Store[]> {
    return this.storePricesService.getAllStores();
  }

  /**
   * GET /store-prices/stores/:id
   * Obtener una tienda por ID
   */
  @Get('stores/:id')
  getStoreById(@Param('id') id: string): Promise<Store> {
    return this.storePricesService.getStoreById(id);
  }

  /**
   * PUT /store-prices/stores/:id
   * Actualizar una tienda
   */
  @Put('stores/:id')
  updateStore(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    return this.storePricesService.updateStore(id, updateStoreDto);
  }

  /**
   * DELETE /store-prices/stores/:id
   * Eliminar una tienda (soft delete)
   */
  @Delete('stores/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStore(@Param('id') id: string): Promise<void> {
    return this.storePricesService.deleteStore(id);
  }

  /**
   * GET /store-prices/stores/nearby?latitude=X&longitude=Y&radiusKm=5
   * Obtener tiendas cercanas a una ubicación
   */
  @Get('stores/nearby/list')
  getNearbyStores(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radiusKm') radiusKm?: string,
  ): Promise<(Store & { distance: number })[]> {
    return this.storePricesService.getNearbyStores(
      Number(latitude),
      Number(longitude),
      radiusKm ? Number(radiusKm) : 5,
    );
  }

  // ============ ENDPOINTS DE PRECIOS ============

  /**
   * POST /store-prices
   * Crear un nuevo precio para un producto en una tienda
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createStorePrice(@Body() createStorePriceDto: CreateStorePriceDto): Promise<StorePrice> {
    return this.storePricesService.createStorePrice(createStorePriceDto);
  }

  /**
   * GET /store-prices/product/:productId
   * Obtener todos los precios disponibles de un producto
   */
  @Get('product/:productId')
  getPricesByProduct(@Param('productId') productId: string): Promise<StorePrice[]> {
    return this.storePricesService.getPricesByProduct(productId);
  }

  /**
   * GET /store-prices/store/:storeId
   * Obtener todos los precios de una tienda
   */
  @Get('store/:storeId')
  getPricesByStore(@Param('storeId') storeId: string): Promise<StorePrice[]> {
    return this.storePricesService.getPricesByStore(storeId);
  }

  /**
   * GET /store-prices/store/:storeId/product/:productId
   * Obtener precio específico de un producto en una tienda
   */
  @Get('store/:storeId/product/:productId')
  getStoreProductPrice(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ): Promise<StorePrice> {
    return this.storePricesService.getStoreProductPrice(storeId, productId);
  }

  /**
   * PUT /store-prices/store/:storeId/product/:productId
   * Actualizar el precio de un producto en una tienda
   */
  @Put('store/:storeId/product/:productId')
  updateStorePrice(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Body() updateStorePriceDto: UpdateStorePriceDto,
  ): Promise<StorePrice> {
    return this.storePricesService.updateStorePrice(
      storeId,
      productId,
      updateStorePriceDto,
    );
  }

  /**
   * DELETE /store-prices/store/:storeId/product/:productId
   * Eliminar el precio de un producto en una tienda
   */
  @Delete('store/:storeId/product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStorePrice(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    return this.storePricesService.deleteStorePrice(storeId, productId);
  }

  /**
   * POST /store-prices/nearby/search
   * Obtener precios de múltiples productos en tiendas cercanas
   */
  @Post('nearby/search')
  getNearbyStoresPrices(@Body() query: GetStoresPricesDto): Promise<
    Array<{
      store: Store & { distance: number };
      prices: StorePrice[];
      totalCost?: number;
    }>
  > {
    return this.storePricesService.getNearbyStoresPrices(query);
  }

  /**
   * GET /store-prices/product/:productId/cheapest?latitude=X&longitude=Y&radiusKm=5
   * Obtener la tienda más barata para un producto
   */
  @Get('product/:productId/cheapest')
  getCheapestStoreForProduct(
    @Param('productId') productId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radiusKm') radiusKm?: string,
  ): Promise<{
    store: Store & { distance: number };
    price: StorePrice;
  } | null> {
    return this.storePricesService.getCheapestStoreForProduct(
      productId,
      Number(latitude),
      Number(longitude),
      radiusKm ? Number(radiusKm) : 5,
    );
  }

  /**
   * POST /store-prices/products/cheapest
   * Obtener los precios más baratos para múltiples productos
   */
  @Post('products/cheapest')
  getCheapestStoresForProducts(
    @Body()
    body: {
      productIds: string[];
      latitude: number;
      longitude: number;
      radiusKm?: number;
    },
  ): Promise<
    Map<
      string,
      {
        store: Store & { distance: number };
        price: StorePrice;
      } | null
    >
  > {
    return this.storePricesService.getCheapestStoresForProducts(
      body.productIds,
      body.latitude,
      body.longitude,
      body.radiusKm || 5,
    );
  }

  /**
   * GET /store-prices/search?productName=X&latitude=Y&longitude=Z&radiusKm=5
   * Buscar productos disponibles en tiendas cercanas
   */
  @Get('search')
  searchProductsInNearbyStores(
    @Query('productName') productName: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radiusKm') radiusKm?: string,
  ): Promise<StorePrice[]> {
    return this.storePricesService.searchProductsInNearbyStores(
      productName,
      Number(latitude),
      Number(longitude),
      radiusKm ? Number(radiusKm) : 5,
    );
  }

  /**
   * GET /store-prices/product/:productId/stats
   * Obtener estadísticas de precios para un producto
   */
  @Get('product/:productId/stats')
  getProductPriceStats(
    @Param('productId') productId: string,
  ): Promise<{
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    storesCount: number;
  } | null> {
    return this.storePricesService.getProductPriceStats(productId);
  }

  /**
   * POST /store-prices/store/:storeId/bulk
   * Obtener precios bulk para múltiples productos
   */
  @Post('store/:storeId/bulk')
  getBulkPrices(
    @Param('storeId') storeId: string,
    @Body() body: { productIds: string[] },
  ): Promise<StorePrice[]> {
    return this.storePricesService.getBulkPrices(storeId, body.productIds);
  }

  /**
   * PUT /store-prices/bulk
   * Actualizar múltiples precios a la vez
   */
  @Put('bulk')
  updateBulkPrices(
    @Body()
    body: Array<{
      storeId: string;
      productId: string;
      price: number;
      isAvailable?: boolean;
    }>,
  ): Promise<StorePrice[]> {
    return this.storePricesService.updateBulkPrices(body);
  }
}
