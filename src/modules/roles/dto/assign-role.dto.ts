import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class AssignRoleDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role, example: Role.Admin })
  @IsEnum(Role)
  role!: Role;
}
