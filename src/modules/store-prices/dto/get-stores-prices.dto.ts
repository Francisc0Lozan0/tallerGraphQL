export class GetStoresPricesDto {
  latitude!: number;
  longitude!: number;
  radiusKm?: number; // Radio en kilómetros para búsqueda de tiendas cercanas
  productIds?: string[]; // IDs de productos para filtrar precios
  limit?: number; // Límite de tiendas a retornar
}
