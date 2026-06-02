import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Recipe } from "./recipe.entity";

@Entity({ name: "recipe_steps" })
@Index("idx_recipe_steps_recipe", ["recipeId"])
export class RecipeStep {
  @PrimaryColumn({ type: "char", length: 24 })
  id!: string;

  @Column({ name: "recipe_id", type: "char" })
  recipeId!: string;

  @Column({ type: "integer" })
  order!: number;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "integer", nullable: true })
  duration?: number | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps)
  @JoinColumn({ name: "recipe_id" })
  recipe!: Recipe;
}
