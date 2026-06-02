import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'stores' })
@Index('idx_store_location', ['latitude', 'longitude'])
@Index('idx_store_active', ['isActive'])
export class Store {
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city?: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 6 })
  latitude!: number;

  @Column({ type: 'numeric', precision: 10, scale: 6 })
  longitude!: number;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
