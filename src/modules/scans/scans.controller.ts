import {
  Body,
  BadRequestException,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryCategory } from '../inventory/entities/inventory-item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { ConfirmScanDto } from './dto/confirm-scan.dto';
import { ScansService } from './scans.service';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('scans')
@ApiBearerAuth()
@Controller('scans')
@UseGuards(JwtAuthGuard)
export class ScansController {
  constructor(
    private readonly scansService: ScansService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Escanear imagen y detectar producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Escaneo procesado' })
  @ApiResponse({ status: 400, description: 'Archivo no enviado' })
  async scan(
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Request() req: any,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Archivo no enviado');
    }

    const result = await this.scansService.analyzeImage(file.buffer);

    if (result.detected.name === 'desconocido') {
      await this.notificationsService.create(req.user.id, {
        type: 'scan_unrecognized',
        title: 'Escaneo no reconocido',
        message: 'No se pudo identificar el producto escaneado. Revisa la imagen o agrégalo manualmente.',
        entityType: 'scan',
        metadata: { labels: result.labels },
      });

      return {
        message: 'No reconocido',
        labels: result.labels,
      };
    }

    return {
      detected: result.detected,
      labels: result.labels,
    };
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Guardar producto detectado en inventario con datos del usuario' })
  @ApiResponse({ status: 201, description: 'Producto guardado en inventario' })
  async confirm(@Body() body: ConfirmScanDto, @Request() req: any) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const mappedCategory = body.category
      ? body.category
      : this.mapDetectedCategoryToInventoryCategory('other');

    const saved = await this.inventoryService.create({
      userId: req.user.id,
      productName: body.detectedName,
      productId: body.productId,
      category: mappedCategory,
      quantity: body.quantity,
      unit: body.unit,
      notes: body.notes,
      expirationDate: expirationDate.toISOString(),
    });

    return {
      saved: {
        ...saved,
        quantity: Number(saved.quantity),
      },
    };
  }

  private mapDetectedCategoryToInventoryCategory(
    category: string,
  ): InventoryCategory | undefined {
    const categoryMap: Record<string, InventoryCategory> = {
      fruta: 'fruits',
      verdura: 'vegetables',
      proteina: 'proteins',
      lacteo: 'dairy',
      grano: 'grains',
      condimento: 'spices',
      legumbre: 'other',
      fruto_seco: 'snacks',
      semilla: 'snacks',
    };

    return categoryMap[category] ?? 'other';
  }

  private getDefaultExpirationDate(): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    return expirationDate.toISOString();
  }
}
