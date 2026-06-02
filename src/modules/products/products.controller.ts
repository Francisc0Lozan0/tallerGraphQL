import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  @ApiBody({ type: CreateProductDto })
  @ApiOperation({ summary: 'Crear producto' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Listado de productos' })
  findAll(@Query('q') q?: string, @Query('category') category?: string) {
    return this.productsService.findAll({ q, category });
  }



  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Buscar producto por código de barras' })
  @ApiParam({ name: 'barcode' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }


  @Get('smart-search')
  @ApiOperation({
    summary: 'Buscar candidatos de productos para scanner',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto detectado por el scanner',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de candidatos encontrados',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron productos',
  })
  smartSearch(@Query('q') q: string) {
    return this.productsService.smartFindProduct(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Nutritionist)
  @ApiBody({ type: UpdateProductDto })
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}