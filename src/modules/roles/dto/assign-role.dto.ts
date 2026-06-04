import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

registerEnumType(Role, { name: 'Role' });

@InputType()
export class AssignRoleDto {
  @Field()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @Field(() => Role)
  @ApiProperty({ enum: Role, example: Role.Admin })
  @IsEnum(Role)
  role!: Role;
}
