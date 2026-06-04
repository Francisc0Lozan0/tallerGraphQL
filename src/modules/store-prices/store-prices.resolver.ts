import { Args, Field, Float, InputType, Mutation, PartialType, Query, Resolver } from '@nestjs/graphql';
import { StorePrice } from './entities/store-price.entity';
import { Store } from './entities/store.entity';
import { StorePricesService } from './store-prices.service';

@InputType()
class CreateStoreInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field(() => Float)
  latitude!: number;

  @Field(() => Float)
  longitude!: number;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  website?: string;
}

@InputType()
class UpdateStoreInput extends PartialType(CreateStoreInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
class CreateStorePriceInput {
  @Field()
  storeId!: string;

  @Field()
  productId!: string;

  @Field(() => Float)
  price!: number;

  @Field({ nullable: true })
  isAvailable?: boolean;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
class UpdateStorePriceInput {
  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  isAvailable?: boolean;

  @Field({ nullable: true })
  notes?: string;
}

@Resolver(() => StorePrice)
export class StorePricesResolver {
  constructor(private readonly storePricesService: StorePricesService) {}

  @Mutation(() => Store)
  createStore(@Args('input') input: CreateStoreInput) {
    return this.storePricesService.createStore(input as any);
  }

  @Query(() => [Store])
  stores() {
    return this.storePricesService.getAllStores();
  }

  @Query(() => Store)
  store(@Args('id') id: string) {
    return this.storePricesService.getStoreById(id);
  }

  @Mutation(() => Store)
  updateStore(@Args('id') id: string, @Args('input') input: UpdateStoreInput) {
    return this.storePricesService.updateStore(id, input as any);
  }

  @Mutation(() => Boolean)
  async deleteStore(@Args('id') id: string) {
    await this.storePricesService.deleteStore(id);
    return true;
  }

  @Mutation(() => StorePrice)
  createStorePrice(@Args('input') input: CreateStorePriceInput) {
    return this.storePricesService.createStorePrice(input as any);
  }

  @Query(() => [StorePrice])
  pricesByProduct(@Args('productId') productId: string) {
    return this.storePricesService.getPricesByProduct(productId);
  }

  @Query(() => [StorePrice])
  pricesByStore(@Args('storeId') storeId: string) {
    return this.storePricesService.getPricesByStore(storeId);
  }

  @Query(() => StorePrice)
  storePrice(
    @Args('storeId') storeId: string,
    @Args('productId') productId: string,
  ) {
    return this.storePricesService.getStoreProductPrice(storeId, productId);
  }

  @Mutation(() => StorePrice)
  updateStorePrice(
    @Args('storeId') storeId: string,
    @Args('productId') productId: string,
    @Args('input') input: UpdateStorePriceInput,
  ) {
    return this.storePricesService.updateStorePrice(storeId, productId, input as any);
  }

  @Mutation(() => Boolean)
  async deleteStorePrice(
    @Args('storeId') storeId: string,
    @Args('productId') productId: string,
  ) {
    await this.storePricesService.deleteStorePrice(storeId, productId);
    return true;
  }
}