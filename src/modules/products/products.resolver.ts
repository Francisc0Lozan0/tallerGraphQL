import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductsService } from './products.service';

@Resolver()
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  createProduct(@Args('input', { type: () => GraphQLJSON }) input: Record<string, any>) {
    return this.productsService.create(input as any);
  }

  @Query(() => [GraphQLJSON])
  products(@Args('filter', { type: () => GraphQLJSON, nullable: true }) filter?: Record<string, any>) {
    return this.productsService.findAll({
      q: filter?.q,
      category: filter?.category,
    });
  }

  @Query(() => GraphQLJSON)
  productByBarcode(@Args('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Query(() => [GraphQLJSON])
  productSmartSearch(@Args('q') q: string) {
    return this.productsService.smartFindProduct(q);
  }

  @Query(() => GraphQLJSON)
  product(@Args('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  updateProduct(
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    return this.productsService.update(id, input as any);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  deleteProduct(@Args('id') id: string) {
    return this.productsService.remove(id);
  }
}
