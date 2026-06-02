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

@Entity({ name: "recipes" })
@Index("idx_recipes_category", ["category"])
@Index("idx_recipes_difficulty", ["difficulty"])
@Index("idx_recipes_public", ["isPublic"])
export class Recipe {
  @PrimaryColumn({ type: "char" })
  id: string;

  @Column({ name: "user_id", type: "char" })
  userId: string;

  @Column({ name: "parent_recipe_id", type: "char", nullable: true })
  parentRecipeId: string | null;

  @Column({ type: "boolean", default: false })
  isCustom: boolean;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "varchar" })
  category: (typeof RECIPE_CATEGORIES)[number];

  @Column({ type: "varchar" })
  difficulty: (typeof RECIPE_DIFFICULTIES)[number];

  @Column({ name: "preparation_time", type: "integer", nullable: true })
  preparationTime: number | null;

  @Column({ name: "cooking_time", type: "integer", nullable: true })
  cookingTime: number | null;

  @Column({ type: "integer", default: 1 })
  servings: number;

  @Column({ name: "image_url", type: "varchar", nullable: true })
  imageUrl: string | null;

  @Column({ type: "numeric", default: 0 })
  rating: number;

  @Column({ name: "rating_count", type: "integer", default: 0 })
  ratingCount: number;

  @Column({ name: "is_public", type: "boolean", default: false })
  isPublic: boolean;

  @Column({ name: "is_vegetarian", type: "boolean", default: false })
  isVegetarian: boolean;

  @Column({ name: "is_vegan", type: "boolean", default: false })
  isVegan: boolean;

  // 🔥 NUTRICIÓN REAL (no json)
  @Column({ name: "ni_calories", type: "numeric", default: 0 })
  niCalories: number;

  @Column({ name: "ni_protein", type: "numeric", default: 0 })
  niProtein: number;

  @Column({ name: "ni_carbohydrates", type: "numeric", default: 0 })
  niCarbohydrates: number;

  @Column({ name: "ni_fat", type: "numeric", default: 0 })
  niFat: number;

  @Column({ name: "ni_fiber", type: "numeric", default: 0 })
  niFiber: number;

  @Column({ name: "ni_sugars", type: "numeric", default: 0 })
  niSugars: number;

  @Column({ name: "ni_sodium", type: "numeric", default: 0 })
  niSodium: number;

  @Column({ name: "ni_serving_size", type: "varchar", nullable: true })
  niServingSize: string | null;

  @Column({ name: "ni_servings_per_recipe", type: "integer", default: 1 })
  niServingsPerRecipe: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe)
  ingredients: RecipeIngredient[];

  @OneToMany(() => RecipeStep, (step) => step.recipe)
  steps: RecipeStep[];

  @AfterLoad()
  formatImageUrl() {
    if (this.imageUrl && !this.imageUrl.startsWith("http")) {
      this.imageUrl = `https://ik.imagekit.io/Alacena/${this.imageUrl}?tr=w-300,h-300`;
    }
  }
}
