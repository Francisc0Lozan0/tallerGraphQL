import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
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
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { ConsumeInventoryItemsDto } from './dto/consume-inventory-items.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiBody({ type: CreateInventoryItemDto })
  @ApiOperation({ summary: 'Crear item de inventario' })
  @ApiResponse({ status: 201, description: 'Item creado' })
  create(@Body() createInventoryItemDto: CreateInventoryItemDto, @Request() req: any) {
    return this.inventoryService.create({
      ...createInventoryItemDto,
      userId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar items de inventario' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Listado de items' })
  findAll(
    @Query('q') q: string | undefined,
    @Query('category') category: string | undefined,
    @Request() req: any,
  ) {
    return this.inventoryService.findAll(req.user.id, { q, category });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de inventario' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  stats(@Request() req: any) {
    return this.inventoryService.stats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener item por id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Item encontrado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateInventoryItemDto })
  @ApiOperation({ summary: 'Actualizar item de inventario' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Item actualizado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
    @Request() req: any,
  ) {
    return this.inventoryService.update(id, req.user.id, updateInventoryItemDto);
  }

  @Patch('consume')
  @ApiBody({ type: ConsumeInventoryItemsDto })
  @ApiOperation({ summary: 'Consumir cantidad de items del inventario' })
  @ApiResponse({ status: 200, description: 'Items descontados' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  consume(
    @Body() consumeDto: ConsumeInventoryItemsDto,
    @Request() req: any,
  ) {
    return this.inventoryService.consumeItems(req.user.id, consumeDto.items);
  }



  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar item de inventario' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Item eliminado' })
  @ApiResponse({ status: 404, description: 'No encontrado' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.remove(id, req.user.id);
  }
}