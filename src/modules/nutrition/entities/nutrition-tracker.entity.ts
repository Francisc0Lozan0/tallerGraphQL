import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

@ObjectType()
export class FoodConsumption {
  @Field()
  productName: string;

  @Field()
  quantity: number;

  @Field()
  unit: string;

  @Field()
  consumedAt: Date;

  @Field()
  mealType: string;
}

@ObjectType()
export class DailyNutritionSummary {
  @Field()
  date: Date;

  @Field()
  calories: number;

  @Field()
  protein: number;

  @Field()
  carbohydrates: number;

  @Field()
  fat: number;

  @Field()
  fiber: number;

  @Field()
  sugars: number;

  @Field()
  sodium: number;

  @Field()
  waterIntake: number;
}

@ObjectType()
@Entity({ name: 'nutrition_trackers' })
@Index('idx_nutrition_trackers_date', ['date'])
export class NutritionTracker {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char', length: 24 })
  id: string;

  @Field()
  @Column({ name: 'user_id', type: 'char', length: 24 })
  userId: string;

  @Field()
  @Column({ type: 'timestamptz' })
  date: Date;

  @Field()
  @Column({ name: 'total_calories', type: 'numeric', default: 0 })
  totalCalories: number;

  @Field()
  @Column({ name: 'total_protein', type: 'numeric', default: 0 })
  totalProtein: number;

  @Field()
  @Column({ name: 'total_carbohydrates', type: 'numeric', default: 0 })
  totalCarbohydrates: number;

  @Field()
  @Column({ name: 'total_fat', type: 'numeric', default: 0 })
  totalFat: number;

  @Field()
  @Column({ name: 'total_fiber', type: 'numeric', default: 0 })
  totalFiber: number;

  @Field(() => Int)
  @Column({ name: 'water_intake_ml', type: 'integer', default: 0 })
  waterIntakeMl: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}