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

@Entity({ name: 'inventory_items' })
@Index('idx_ii_expiration', ['userId', 'expirationDate'])
@Index('idx_ii_category', ['userId', 'category'])
@Index('idx_ii_alert', ['userId', 'alertSent', 'expirationDate'])
@Index('idx_ii_barcode', ['barcode', 'userId'])
@Index('idx_ii_product', ['productId'])
export class InventoryItem {
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 24 })
  userId!: string;

  @Column({ name: 'product_id', type: 'char', length: 24, nullable: true })
  productId?: string | null;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @Column({ name: 'product_name', type: 'varchar', length: 100 })
  productName!: string;

  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0 })
  quantity!: number;

  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  @Column({ name: 'purchase_date', type: 'timestamptz', nullable: true })
  purchaseDate: Date | null;

  @Column({ name: 'expiration_date', type: 'timestamptz' })
  expirationDate!: Date;

  @Column({ type: 'varchar', length: 30, nullable: true })
  category?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'alert_sent', type: 'boolean', default: false })
  alertSent!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}