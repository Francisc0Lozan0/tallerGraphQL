import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Field, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@ObjectType()
class DeleteUserResponse {
  @Field()
  deleted!: boolean;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  me(@Context('req') req: RequestWithUser) {
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.findById(userId);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateMe(
    @Context('req') req: RequestWithUser,
    @Args('input') input: UpdateUserDto,
  ) {
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.update(userId, input);
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RolesGuard)
  users() {
    return this.usersService.findAll();
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  user(@Args('id') id: string) {
    return this.usersService.findById(id).then((found) => {
      if (!found) {
        throw new NotFoundException('User not found');
      }
      return found;
    });
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserDto,
  ) {
    return this.usersService.update(id, input).then((updated) => {
      if (!updated) {
        throw new NotFoundException('User not found');
      }
      return updated;
    });
  }

  @Mutation(() => DeleteUserResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteUser(@Args('id') id: string) {
    const ok = await this.usersService.delete(id);
    if (!ok) {
      throw new NotFoundException('User not found');
    }
    return { deleted: true };
  }
}
