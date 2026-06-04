import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
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

@ObjectType()
@Entity({ name: "recipe_ingredients" })
@Index("idx_recipe_ingredients_recipe", ["recipeId"])
@Index("idx_recipe_ingredients_product", ["productId"])
export class RecipeIngredient {
  @Field(() => ID)
  @PrimaryColumn({ type: "char", length: 24 })
  id!: string;

  @Field()
  @Column({ name: "recipe_id", type: "char" })
  recipeId!: string;

  @Field({ nullable: true })
  @Column({ name: "product_id", type: "char", length: 24, nullable: true })
  productId?: string | null;

  @Field({ nullable: true })
  @Column({
    name: "generic_name",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  genericName?: string | null;

  @Field(() => Float)
  @Column({ type: "numeric", precision: 10, scale: 3 })
  quantity!: number;

  @Field()
  @Column({ type: "varchar", length: 30 })
  unit!: string;

  @Field()
  @Column({ type: "boolean", default: false })
  optional!: boolean;

  @Field()
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients)
  @JoinColumn({ name: "recipe_id" })
  recipe: Recipe;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product?: Product | null;
}
