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
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { PrepareRecipeDto } from './dto/prepare-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';

class RateRecipeDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiBody({ type: CreateRecipeDto })
  @ApiOperation({ summary: 'Crear receta' })
  @ApiResponse({ status: 201, description: 'Receta creada' })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar recetas' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'isPublic', required: false })
  @ApiResponse({ status: 200, description: 'Listado de recetas' })
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('isPublic') isPublic?: string,
  ) {
    return this.recipesService.findAll({ q, category, difficulty, isPublic });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener receta por id' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Receta encontrada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateRecipeDto })
  @ApiOperation({ summary: 'Actualizar receta' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Receta actualizada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Patch(':id/rate')
  @ApiBody({ type: RateRecipeDto })
  @ApiOperation({ summary: 'Calificar receta (1 a 5)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Receta calificada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  rate(@Param('id') id: string, @Body() rateRecipeDto: RateRecipeDto) {
    return this.recipesService.rate(id, rateRecipeDto.rating);
  }

  @Post(':id/prepare')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: PrepareRecipeDto })
  @ApiOperation({ summary: 'Preparar receta y descontar inventario' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Inventario actualizado' })
  prepare(
    @Param('id') id: string,
    @Body() prepareRecipeDto: PrepareRecipeDto,
    @Request() req: any,
  ) {
    return this.recipesService.prepare(id, req.user.id, prepareRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar receta' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Receta eliminada' })
  @ApiResponse({ status: 404, description: 'No encontrada' })
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}
