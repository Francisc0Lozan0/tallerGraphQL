import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
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

registerEnumType(DietType, { name: 'DietType' });

@ObjectType()
@Entity({ name: 'nutrition_profiles' })
@Index('uq_nutrition_profile_user_id', ['userId'], { unique: true })
export class NutritionProfile {
  @Field(() => ID)
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Field()
  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Field(() => DietType)
  @Column({ name: 'diet_type', type: 'varchar', default: DietType.Sin_dieta })
  dietType!: DietType;

  @Field(() => [String])
  @Column({
    name: 'excluded_ingredients',
    type: 'text',
    array: true,
    default: '{}',
  })
  excludedIngredients!: string[];

  @Field(() => [String])
  @Column({
    name: 'excluded_categories',
    type: 'text',
    array: true,
    default: '{}',
  })
  excludedCategories!: string[];

  @Field(() => Int, { nullable: true })
  @Column({ name: 'max_daily_calories', type: 'integer', nullable: true })
  maxDailyCalories!: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'target_protein', type: 'integer', nullable: true })
  targetProtein!: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'target_carbs', type: 'integer', nullable: true })
  targetCarbs!: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'target_fat', type: 'integer', nullable: true })
  targetFat!: number | null;

  @Field()
  @Column({ name: 'is_setup_complete', type: 'boolean', default: false })
  isSetupComplete!: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
