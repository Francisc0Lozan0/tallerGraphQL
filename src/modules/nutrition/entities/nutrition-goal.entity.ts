import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class NutritionGoalTarget {
  dailyCalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarLimitGrams: number;
  sodiumLimitMg: number;
}



@Entity({ name: 'nutrition_goals' })
@Index('idx_nutrition_goals_is_active', ['isActive'])
export class NutritionGoal {
  @PrimaryColumn({ type: 'char' })
  id: string;

  @Column({ name: 'user_id', type: 'char' })
  userId: string;

  @Column({ name: 'goal_daily_calories', type: 'integer' })
  goalDailyCalories: number;

  @Column({ name: 'goal_protein_grams', type: 'numeric', default: 0 })
  goalProteinGrams: number;

  @Column({ name: 'goal_carbohydrates_grams', type: 'numeric', default: 0 })
  goalCarbohydratesGrams: number;

  @Column({ name: 'goal_fat_grams', type: 'numeric', default: 0 })
  goalFatGrams: number;

  @Column({ name: 'goal_fiber_grams', type: 'numeric', default: 0 })
  goalFiberGrams: number;

  @Column({ name: 'goal_sugar_limit_grams', type: 'numeric', nullable: true })
  goalSugarLimitGrams: number | null;

  @Column({ name: 'goal_sodium_limit_mg', type: 'numeric', nullable: true })
  goalSodiumLimitMg: number | null;

  @Column({ name: 'goal_water_ml', type: 'integer', default: 2000, nullable: true })
  goalWaterMl: number | null;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}