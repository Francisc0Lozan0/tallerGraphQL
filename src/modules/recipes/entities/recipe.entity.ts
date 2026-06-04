import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { RecipeIngredient } from "./recipe-ingredient.entity";
import { RecipeStep } from "./recipe-step.entity";

export const RECIPE_CATEGORIES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "beverage",
] as const;

export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

@ObjectType()
@Entity({ name: "recipes" })
@Index("idx_recipes_category", ["category"])
@Index("idx_recipes_difficulty", ["difficulty"])
@Index("idx_recipes_public", ["isPublic"])
export class Recipe {
  @Field(() => ID)
  @PrimaryColumn({ type: "char" })
  id: string;

  @Field()
  @Column({ name: "user_id", type: "char" })
  userId: string;

  @Field({ nullable: true })
  @Column({ name: "parent_recipe_id", type: "char", nullable: true })
  parentRecipeId: string | null;

  @Field()
  @Column({ type: "boolean", default: false })
  isCustom: boolean;

  @Field()
  @Column({ type: "varchar" })
  name: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description: string | null;

  @Field()
  @Column({ type: "varchar" })
  category: string;

  @Field()
  @Column({ type: "varchar" })
  difficulty: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: "preparation_time", type: "integer", nullable: true })
  preparationTime: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: "cooking_time", type: "integer", nullable: true })
  cookingTime: number | null;

  @Field(() => Int)
  @Column({ type: "integer", default: 1 })
  servings: number;

  @Field({ nullable: true })
  @Column({ name: "image_url", type: "varchar", nullable: true })
  imageUrl: string | null;

  @Field(() => Float)
  @Column({ type: "numeric", default: 0 })
  rating: number;

  @Field(() => Int)
  @Column({ name: "rating_count", type: "integer", default: 0 })
  ratingCount: number;

  @Field()
  @Column({ name: "is_public", type: "boolean", default: false })
  isPublic: boolean;

  @Field()
  @Column({ name: "is_vegetarian", type: "boolean", default: false })
  isVegetarian: boolean;

  @Field()
  @Column({ name: "is_vegan", type: "boolean", default: false })
  isVegan: boolean;

  @Field(() => Float)
  @Column({ name: "ni_calories", type: "numeric", default: 0 })
  niCalories: number;

  @Field(() => Float)
  @Column({ name: "ni_protein", type: "numeric", default: 0 })
  niProtein: number;

  @Field(() => Float)
  @Column({ name: "ni_carbohydrates", type: "numeric", default: 0 })
  niCarbohydrates: number;

  @Field(() => Float)
  @Column({ name: "ni_fat", type: "numeric", default: 0 })
  niFat: number;

  @Field(() => Float)
  @Column({ name: "ni_fiber", type: "numeric", default: 0 })
  niFiber: number;

  @Field(() => Float)
  @Column({ name: "ni_sugars", type: "numeric", default: 0 })
  niSugars: number;

  @Field(() => Float)
  @Column({ name: "ni_sodium", type: "numeric", default: 0 })
  niSodium: number;

  @Field({ nullable: true })
  @Column({ name: "ni_serving_size", type: "varchar", nullable: true })
  niServingSize: string | null;

  @Field(() => Int)
  @Column({ name: "ni_servings_per_recipe", type: "integer", default: 1 })
  niServingsPerRecipe: number;

  @Field()
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  @Field(() => [RecipeIngredient])
  @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe)
  ingredients: RecipeIngredient[];

  @Field(() => [RecipeStep])
  @OneToMany(() => RecipeStep, (step) => step.recipe)
  steps: RecipeStep[];

  @AfterLoad()
  formatImageUrl() {
    if (this.imageUrl && !this.imageUrl.startsWith("http")) {
      this.imageUrl = `https://ik.imagekit.io/Alacena/${this.imageUrl}?tr=w-300,h-300`;
    }
  }
}
