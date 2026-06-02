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
import { Product } from "../../products/entities/product.entity";
import { Recipe } from "./recipe.entity";

@Entity({ name: "recipe_ingredients" })
@Index("idx_recipe_ingredients_recipe", ["recipeId"])
@Index("idx_recipe_ingredients_product", ["productId"])
export class RecipeIngredient {
  @PrimaryColumn({ type: "char", length: 24 })
  id!: string;

  @Column({ name: "recipe_id", type: "char" })
  recipeId!: string;

  @Column({ name: "product_id", type: "char", length: 24, nullable: true })
  productId?: string | null;

  @Column({
    name: "generic_name",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  genericName?: string | null;

  @Column({ type: "numeric", precision: 10, scale: 3 })
  quantity!: number;

  @Column({ type: "varchar", length: 30 })
  unit!: string;

  @Column({ type: "boolean", default: false })
  optional!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product?: Product | null;
}
