import { UseGuards } from '@nestjs/common';
import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@ObjectType()
class AssignRoleResponse {
  @Field()
  message!: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class RolesResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => AssignRoleResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async assignRole(
    @Args('email') email: string,
    @Args('role') role: string,
  ) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'User not found' };
    }
    user.role = role as any;
    await this.usersService.update(user.id, user as any);
    return { message: 'Role assigned successfully', user };
  }
}
