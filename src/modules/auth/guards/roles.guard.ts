import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    interface RequestWithUser {
      user?: {
        role?: string;
      };
    }

    const request =
      context.getType<'graphql' | 'http'>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const userRole = user.role as Role | undefined;

    if (!userRole) {
      return false;
    }

    if (requiredRoles.includes(userRole)) {
      return true;
    }

    if (userRole === Role.SuperAdmin && requiredRoles.includes(Role.Admin)) {
      return true;
    }

    return false;
  }
}
