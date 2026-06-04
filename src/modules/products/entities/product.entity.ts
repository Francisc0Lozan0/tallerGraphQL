import { Field, ID, Int, ObjectType, Float } from '@nestjs/graphql';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export const PRODUCT_CATEGORIES = [
  'fruits',
  'vegetables',
  'proteins',
  'dairy',
  'grains',
  'oils',
  'spices',
  'beverages',
  'snacks',
  'prepared-foods',
  'other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

@ObjectType()
@Entity({ name: 'products' })
@Index('idx_prod_category', ['category'])
@Index('idx_prod_ext', ['externalSource', 'externalId'])
export class Product {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 150, nullable: true })
  brand?: string | null;

  @Field()
  @Column({ type: 'varchar', length: 30 })
  category!: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  barcode?: string | null;

  @Field()
  @Column({ type: 'varchar', length: 30 })
  unit!: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'external_source', type: 'varchar', length: 30, nullable: true })
  externalSource?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'external_id', type: 'varchar', length: 100, nullable: true })
  externalId?: string | null;

  @Field(() => Int)
  @Column({ name: 'ni_calories', type: 'integer', default: 0 })
  niCalories!: number;

  @Field(() => Float)
  @Column({ name: 'ni_protein', type: 'numeric', precision: 10, scale: 2, default: 0 })
  niProtein!: number;

  @Field(() => Float)
  @Column({ name: 'ni_carbohydrates', type: 'numeric', precision: 10, scale: 2, default: 0 })
  niCarbohydrates!: number;

  @Field(() => Float)
  @Column({ name: 'ni_fat', type: 'numeric', precision: 10, scale: 2, default: 0 })
  niFat!: number;

  @Field(() => Float)
  @Column({ name: 'ni_fiber', type: 'numeric', precision: 10, scale: 2, default: 0 })
  niFiber!: number;

  @Field(() => Float)
  @Column({ name: 'ni_sugars', type: 'numeric', precision: 10, scale: 2, default: 0 })
  niSugars!: number;

  @Field(() => Float)
  @Column({ name: 'ni_sodium', type: 'numeric', precision: 10, scale: 2, default: 0 })
  niSodium!: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'ni_serving_size', type: 'varchar', length: 50, nullable: true })
  niServingSize?: string | null;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @AfterLoad()
  formatImageUrl() {
    if (this.imageUrl && !this.imageUrl.startsWith('http')) {
      this.imageUrl = `https://ik.imagekit.io/Alacena/${this.imageUrl}?tr=w-300,h-300`;
    }
  }
}
