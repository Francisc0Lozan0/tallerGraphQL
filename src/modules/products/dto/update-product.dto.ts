import { Field, Float, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateProductDto } from './create-product.dto';

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  unit?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  externalSource?: string;

  @Field({ nullable: true })
  externalId?: string;

  @Field(() => Int, { nullable: true })
  niCalories?: number;

  @Field(() => Float, { nullable: true })
  niProtein?: number;

  @Field(() => Float, { nullable: true })
  niCarbohydrates?: number;

  @Field(() => Float, { nullable: true })
  niFat?: number;

  @Field(() => Float, { nullable: true })
  niFiber?: number;

  @Field(() => Float, { nullable: true })
  niSugars?: number;

  @Field(() => Float, { nullable: true })
  niSodium?: number;

  @Field({ nullable: true })
  niServingSize?: string;
}
