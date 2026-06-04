import { UseGuards } from '@nestjs/common';
import { Args, InputType, Field, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@InputType()
class ProductFilter {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  category?: string;
}

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  createProduct(@Args('input') input: CreateProductDto) {
    return this.productsService.create(input);
  }

  @Query(() => [Product])
  products(@Args('filter', { type: () => ProductFilter, nullable: true }) filter?: ProductFilter) {
    return this.productsService.findAll({
      q: filter?.q,
      category: filter?.category,
    });
  }

  @Query(() => Product, { nullable: true })
  productByBarcode(@Args('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Query(() => [Product])
  productSmartSearch(@Args('q') q: string) {
    return this.productsService.smartFindProduct(q);
  }

  @Query(() => Product)
  product(@Args('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductDto,
  ) {
    return this.productsService.update(id, input);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  deleteProduct(@Args('id') id: string) {
    return this.productsService.remove(id);
  }
}
