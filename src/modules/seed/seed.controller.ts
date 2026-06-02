import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SeedService } from './seed.service';

@ApiTags('seed')
@ApiBearerAuth()
@Controller('seed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('run')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Run initial seed (Admin only)' })
  @ApiResponse({ status: 200, description: 'Seed completed' })
  runSeed() {
    return this.seedService.seed();
  }
}
