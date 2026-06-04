import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
@Entity({ name: 'store_prices' })
@Index('idx_store_price_store', ['storeId'])
@Index('idx_store_price_product', ['productId'])
@Index('idx_store_price_store_product', ['storeId', 'productId'], { unique: true })
@Index('idx_store_price_updated', ['updatedAt'])
export class StorePrice {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Field()
  @Column({ name: 'store_id', type: 'char', length: 24 })
  storeId!: string;

  @Field(() => Store, { nullable: true })
  @ManyToOne(() => Store, { eager: true })
  @JoinColumn({ name: 'store_id' })
  store?: Store;

  @Field()
  @Column({ name: 'product_id', type: 'char', length: 24 })
  productId!: string;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Field(() => Float)
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: number;

  @Field()
  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable!: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  notes?: string | null;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
