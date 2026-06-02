import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Request,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	@ApiOperation({ summary: 'Obtener usuario autenticado' })
	@ApiResponse({ status: 200, description: 'Usuario autenticado' })
	async me(@Request() req: any) {
		const userId = req.user?.id as string | undefined;
		if (!userId) {
			throw new NotFoundException('User not found');
		}
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	@Patch('me')
	@ApiOperation({ summary: 'Actualizar usuario autenticado' })
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({ status: 200, description: 'Usuario actualizado' })
	async updateMe(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
		const userId = req.user?.id as string | undefined;
		if (!userId) {
			throw new NotFoundException('User not found');
		}
		const user = await this.usersService.update(userId, updateUserDto);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	@Get()
	@Roles(Role.Admin)
	@ApiOperation({ summary: 'Listar usuarios (Admin)' })
	@ApiResponse({ status: 200, description: 'Listado de usuarios' })
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	@Roles(Role.Admin)
	@ApiOperation({ summary: 'Obtener usuario por id (Admin)' })
	@ApiParam({ name: 'id' })
	@ApiResponse({ status: 200, description: 'Usuario encontrado' })
	@ApiResponse({ status: 404, description: 'No encontrado' })
	async findOne(@Param('id') id: string) {
		const user = await this.usersService.findById(id);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	@Patch(':id')
	@Roles(Role.Admin)
	@ApiOperation({ summary: 'Actualizar usuario (Admin)' })
	@ApiParam({ name: 'id' })
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({ status: 200, description: 'Usuario actualizado' })
	@ApiResponse({ status: 404, description: 'No encontrado' })
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		const user = await this.usersService.update(id, updateUserDto);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	@Delete(':id')
	@Roles(Role.Admin)
	@ApiOperation({ summary: 'Eliminar usuario (Admin)' })
	@ApiParam({ name: 'id' })
	@ApiResponse({ status: 200, description: 'Usuario eliminado' })
	@ApiResponse({ status: 404, description: 'No encontrado' })
	async remove(@Param('id') id: string) {
		const ok = await this.usersService.delete(id);
		if (!ok) {
			throw new NotFoundException('User not found');
		}
		return { deleted: true };
	}
}
