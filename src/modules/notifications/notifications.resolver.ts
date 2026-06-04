import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Context, Int, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [Notification])
  @UseGuards(JwtAuthGuard)
  notifications(@Context('req') request: RequestWithUser) {
    return this.notificationsService.findAll(this.getUserId(request));
  }

  @Query(() => Int)
  @UseGuards(JwtAuthGuard)
  unreadNotificationsCount(@Context('req') request: RequestWithUser) {
    return this.notificationsService.unreadCount(this.getUserId(request));
  }

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    return userId;
  }
}