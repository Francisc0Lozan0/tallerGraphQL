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

@Entity({ name: 'store_prices' })
@Index('idx_store_price_store', ['storeId'])
@Index('idx_store_price_product', ['productId'])
@Index('idx_store_price_store_product', ['storeId', 'productId'], { unique: true })
@Index('idx_store_price_updated', ['updatedAt'])
export class StorePrice {
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Column({ name: 'store_id', type: 'char', length: 24 })
  storeId!: string;

  @ManyToOne(() => Store, { eager: true })
  @JoinColumn({ name: 'store_id' })
  store?: Store;

  @Column({ name: 'product_id', type: 'char', length: 24 })
  productId!: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
