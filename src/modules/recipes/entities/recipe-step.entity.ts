import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
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

@ObjectType()
@Entity({ name: "recipe_steps" })
@Index("idx_recipe_steps_recipe", ["recipeId"])
export class RecipeStep {
  @Field(() => ID)
  @PrimaryColumn({ type: "char", length: 24 })
  id!: string;

  @Field()
  @Column({ name: "recipe_id", type: "char" })
  recipeId!: string;

  @Field(() => Int)
  @Column({ type: "integer" })
  order!: number;

  @Field()
  @Column({ type: "text" })
  description!: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: "integer", nullable: true })
  duration?: number | null;

  @Field()
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps)
  @JoinColumn({ name: "recipe_id" })
  recipe!: Recipe;
}
