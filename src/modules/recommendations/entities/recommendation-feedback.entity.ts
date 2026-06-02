import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'recommendation_feedbacks' })
@Index('idx_rf_recipe_rating', ['recipeId', 'rating'])
@Index('uq_rf_user_recipe', ['userId', 'recipeId'], { unique: true })
export class RecommendationFeedback {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'recipe_id', type: 'varchar' })
  recipeId: string;

  @Column({ type: 'integer' })
  rating!: number;

  @Column({ type: 'boolean', default: false })
  prepared!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  feedback?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
