export class CreateStoreDto {
  name!: string;
  address?: string;
  city?: string;
  latitude!: number;
  longitude!: number;
  phoneNumber?: string;
  website?: string;
}
