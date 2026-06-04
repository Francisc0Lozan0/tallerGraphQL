import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export const INVENTORY_CATEGORIES = [
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

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export const INVENTORY_UNITS = ['kg', 'g', 'ml', 'l', 'pieces', 'units'] as const;

@ObjectType()
@Entity({ name: 'inventory_items' })
@Index('idx_ii_expiration', ['userId', 'expirationDate'])
@Index('idx_ii_category', ['userId', 'category'])
@Index('idx_ii_alert', ['userId', 'alertSent', 'expirationDate'])
@Index('idx_ii_barcode', ['barcode', 'userId'])
@Index('idx_ii_product', ['productId'])
export class InventoryItem {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Field()
  @Column({ name: 'user_id', type: 'char', length: 24 })
  userId!: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'product_id', type: 'char', length: 24, nullable: true })
  productId?: string | null;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field()
  @Column({ name: 'product_name', type: 'varchar', length: 100 })
  productName!: string;

  @Field(() => Float)
  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0 })
  quantity!: number;

  @Field()
  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  @Field(() => Date, { nullable: true })
  @Column({ name: 'purchase_date', type: 'timestamptz', nullable: true })
  purchaseDate: Date | null;

  @Field()
  @Column({ name: 'expiration_date', type: 'timestamptz' })
  expirationDate!: Date;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 30, nullable: true })
  category?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Field()
  @Column({ name: 'alert_sent', type: 'boolean', default: false })
  alertSent!: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}