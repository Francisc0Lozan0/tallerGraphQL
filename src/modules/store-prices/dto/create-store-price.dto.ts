export class CreateStorePriceDto {
  storeId!: string;
  productId!: string;
  price!: number;
  isAvailable?: boolean;
  notes?: string;
}
