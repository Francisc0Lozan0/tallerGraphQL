import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly usersService: UsersService) {}

  @Post('assign')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Assign a role to a user (Admin only)' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async assignRole(@Body() body: AssignRoleDto) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      return { message: 'User not found' };
    }
    user.role = body.role;
    await this.usersService.update(user.id, user);
    return { message: 'Role assigned successfully', user };
  }
}
