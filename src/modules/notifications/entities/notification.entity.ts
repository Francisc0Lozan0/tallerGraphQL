import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export const NOTIFICATION_TYPES = [
  'expiration_warning',
  'expired_item',
  'stock_low',
  'stock_depleted',
  'scan_unrecognized',
  'recipe_consumption',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

@Entity({ name: 'notifications' })
@Index('idx_notifications_user_created', ['userId', 'createdAt'])
@Index('idx_notifications_user_read', ['userId', 'isRead'])
export class Notification {
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 24 })
  userId!: string;

  @Column({ type: 'varchar', length: 40 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 40, nullable: true })
  entityType?: string | null;

  @Column({ name: 'entity_id', type: 'char', length: 24, nullable: true })
  entityId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}