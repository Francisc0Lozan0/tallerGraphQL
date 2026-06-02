import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DietType {
  Sin_dieta = 'sin_dieta',
  Vegetarian = 'vegetarian',
  Vegan = 'vegan',
}

@Entity({ name: 'nutrition_profiles' })
@Index('uq_nutrition_profile_user_id', ['userId'], { unique: true })
export class NutritionProfile {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Column({ name: 'diet_type', type: 'varchar', default: DietType.Sin_dieta })
  dietType!: DietType;

  @Column({
    name: 'excluded_ingredients',
    type: 'text',
    array: true,
    default: '{}',
  })
  excludedIngredients!: string[];

  @Column({
    name: 'excluded_categories',
    type: 'text',
    array: true,
    default: '{}',
  })
  excludedCategories!: string[];

  @Column({ name: 'max_daily_calories', type: 'integer', nullable: true })
  maxDailyCalories!: number | null;

  @Column({ name: 'target_protein', type: 'integer', nullable: true })
  targetProtein!: number | null;

  @Column({ name: 'target_carbs', type: 'integer', nullable: true })
  targetCarbs!: number | null;

  @Column({ name: 'target_fat', type: 'integer', nullable: true })
  targetFat!: number | null;

  @Column({ name: 'is_setup_complete', type: 'boolean', default: false })
  isSetupComplete!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
