import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export class FoodConsumption {
  productName: string;
  quantity: number;
  unit: string;
  consumedAt: Date;
  mealType: (typeof MEAL_TYPES)[number];
}

export class DailyNutritionSummary {
  date: Date;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugars: number;
  sodium: number;
  waterIntake: number;
}



@Entity({ name: 'nutrition_trackers' })
@Index('idx_nutrition_trackers_date', ['date'])
export class NutritionTracker {
  @PrimaryColumn({ type: 'char', length: 24 })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 24 })
  userId: string;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ name: 'total_calories', type: 'numeric', default: 0 })
  totalCalories: number;

  @Column({ name: 'total_protein', type: 'numeric', default: 0 })
  totalProtein: number;

  @Column({ name: 'total_carbohydrates', type: 'numeric', default: 0 })
  totalCarbohydrates: number;

  @Column({ name: 'total_fat', type: 'numeric', default: 0 })
  totalFat: number;

  @Column({ name: 'total_fiber', type: 'numeric', default: 0 })
  totalFiber: number;

  @Column({ name: 'water_intake_ml', type: 'integer', default: 0 })
  waterIntakeMl: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}