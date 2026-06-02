import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Listado de notificaciones' })
  findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificaciones sin leer' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones sin leer' })
  unreadCount(@Request() req: any) {
    return this.notificationsService.unreadCount(req.user.id);
  }

  @Post('sync-expiring')
  @ApiOperation({ summary: 'Generar notificaciones de inventario por vencer' })
  @ApiResponse({ status: 200, description: 'Notificaciones generadas' })
  syncExpiring(@Request() req: any) {
    return this.notificationsService.syncInventoryNotifications(req.user.id);
  }

  @Post('test')
  @ApiOperation({ summary: 'Crear notificación de prueba para el usuario autenticado' })
  @ApiResponse({ status: 201, description: 'Notificación creada' })
  async createTest(@Request() req: any) {
    return this.notificationsService.create(req.user.id, {
      type: 'system' as any,
      title: 'Notificación de prueba',
      message: 'Notificación enviada desde la app.',
      metadata: { source: 'app-test' },
    });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada' })
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída (compatibilidad)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada' })
  markAsReadCompat(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones actualizadas' })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas (compatibilidad)' })
  @ApiResponse({ status: 200, description: 'Notificaciones actualizadas' })
  markAllAsReadCompat(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}