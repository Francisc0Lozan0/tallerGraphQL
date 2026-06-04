import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'recommendation_feedbacks' })
@Index('idx_rf_recipe_rating', ['recipeId', 'rating'])
@Index('uq_rf_user_recipe', ['userId', 'recipeId'], { unique: true })
export class RecommendationFeedback {
  @Field(() => ID)
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Field()
  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Field()
  @Column({ name: 'recipe_id', type: 'varchar' })
  recipeId: string;

  @Field(() => Int)
  @Column({ type: 'integer' })
  rating!: number;

  @Field()
  @Column({ type: 'boolean', default: false })
  prepared!: boolean;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  feedback?: string | null;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
