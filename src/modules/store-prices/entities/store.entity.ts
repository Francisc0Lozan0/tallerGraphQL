import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'stores' })
@Index('idx_store_location', ['latitude', 'longitude'])
@Index('idx_store_active', ['isActive'])
export class Store {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  city?: string | null;

  @Field(() => Float)
  @Column({ type: 'numeric', precision: 10, scale: 6 })
  latitude!: number;

  @Field(() => Float)
  @Column({ type: 'numeric', precision: 10, scale: 6 })
  longitude!: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string | null;

  @Field()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
