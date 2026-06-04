import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Sex {
  Hombre = 'hombre',
  Mujer = 'mujer',
}

export enum ActivityLevel {
  Sedentario = 'sedentario',
  Ligero = 'ligero',
  Moderado = 'moderado',
  Activo = 'activo',
  MuyActivo = 'muy_activo',
}

export enum NutritionGoal {
  Bajar = 'bajar',
  Mantener = 'mantener',
  Subir = 'subir',
}

registerEnumType(Sex, { name: 'Sex' });
registerEnumType(ActivityLevel, { name: 'ActivityLevel' });
registerEnumType(NutritionGoal, { name: 'UserNutritionGoal' });

@ObjectType()
@Entity({ name: 'users' })
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_created', ['createdAt'])
export class User {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char', length: 24 })
  id!: string;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Field()
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Field()
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Field()
  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: Date;

  @Field(() => Sex)
  @Column({ name: 'sex', type: 'varchar', length: 10 })
  sex!: Sex;

  @Field()
  @Column({ name: 'weight_kg', type: 'numeric', precision: 6, scale: 2 })
  weightKg!: number;

  @Field()
  @Column({ name: 'height_cm', type: 'numeric', precision: 6, scale: 2 })
  heightCm!: number;

  @Field(() => ActivityLevel)
  @Column({ name: 'activity_level', type: 'varchar', length: 20 })
  activityLevel!: ActivityLevel;

  @Field(() => NutritionGoal)
  @Column({ name: 'goal', type: 'varchar', length: 20 })
  goal!: NutritionGoal;

  @Field(() => String, { nullable: true })
  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: true })
  phoneNumber?: string | null;

  @Field()
  @Column({
    name: 'email_notifications_enabled',
    type: 'boolean',
    default: false,
  })
  emailNotificationsEnabled!: boolean;

  @Field()
  @Column({
    name: 'sms_notifications_enabled',
    type: 'boolean',
    default: false,
  })
  smsNotificationsEnabled!: boolean;

  @Field(() => String, { nullable: true })
  @Column({ name: 'profile_image', type: 'varchar', length: 500, nullable: true })
  profileImage?: string | null;

  @Field()
  @Column({ type: 'varchar', length: 20, default: 'user' })
  role!: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'goal_daily_calories', type: 'integer', nullable: true })
  goalDailyCalories?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'goal_protein_grams', type: 'integer', nullable: true })
  goalProteinGrams?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'goal_carbs_grams', type: 'integer', nullable: true })
  goalCarbsGrams?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'goal_fat_grams', type: 'integer', nullable: true })
  goalFatGrams?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'goal_fiber_grams', type: 'integer', nullable: true })
  goalFiberGrams?: number | null;

  @Field()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date | null;

  @Column({ name: 'reset_code', type: 'varchar', length: 10, nullable: true })
  resetCode?: string | null;

  @Column({ name: 'reset_code_expires_at', type: 'timestamptz', nullable: true })
  resetCodeExpiresAt?: Date | null;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
