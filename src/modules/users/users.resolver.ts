import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard, RolesGuard)
  me(@Context('req') req: RequestWithUser) {
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.findById(userId);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateMe(
    @Context('req') req: RequestWithUser,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.usersService.update(userId, input as any);
  }

  @Query(() => [GraphQLJSON])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  users() {
    return this.usersService.findAll();
  }

  @Query(() => GraphQLJSON)
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

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  updateUser(
    @Args('id') id: string,
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    return this.usersService.update(id, input as any).then((updated) => {
      if (!updated) {
        throw new NotFoundException('User not found');
      }
      return updated;
    });
  }

  @Mutation(() => GraphQLJSON)
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
