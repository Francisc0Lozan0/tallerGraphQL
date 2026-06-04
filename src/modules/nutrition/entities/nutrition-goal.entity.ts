import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
export class NutritionGoalTarget {
  @Field(() => Int)
  dailyCalories: number;

  @Field(() => Int)
  proteinGrams: number;

  @Field(() => Int)
  carbohydratesGrams: number;

  @Field(() => Int)
  fatGrams: number;

  @Field(() => Int)
  fiberGrams: number;

  @Field(() => Int)
  sugarLimitGrams: number;

  @Field(() => Int)
  sodiumLimitMg: number;
}

@ObjectType()
@Entity({ name: 'nutrition_goals' })
@Index('idx_nutrition_goals_is_active', ['isActive'])
export class NutritionGoal {
  @Field(() => ID)
  @PrimaryColumn({ type: 'char' })
  id: string;

  @Field()
  @Column({ name: 'user_id', type: 'char' })
  userId: string;

  @Field(() => Int)
  @Column({ name: 'goal_daily_calories', type: 'integer' })
  goalDailyCalories: number;

  @Field()
  @Column({ name: 'goal_protein_grams', type: 'numeric', default: 0 })
  goalProteinGrams: number;

  @Field()
  @Column({ name: 'goal_carbohydrates_grams', type: 'numeric', default: 0 })
  goalCarbohydratesGrams: number;

  @Field()
  @Column({ name: 'goal_fat_grams', type: 'numeric', default: 0 })
  goalFatGrams: number;

  @Field()
  @Column({ name: 'goal_fiber_grams', type: 'numeric', default: 0 })
  goalFiberGrams: number;

  @Field({ nullable: true })
  @Column({ name: 'goal_sugar_limit_grams', type: 'numeric', nullable: true })
  goalSugarLimitGrams: number | null;

  @Field({ nullable: true })
  @Column({ name: 'goal_sodium_limit_mg', type: 'numeric', nullable: true })
  goalSodiumLimitMg: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'goal_water_ml', type: 'integer', default: 2000, nullable: true })
  goalWaterMl: number | null;

  @Field()
  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Field({ nullable: true })
  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Field()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}