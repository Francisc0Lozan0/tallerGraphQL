import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => GraphQLJSON)
  register(@Args('input', { type: () => GraphQLJSON }) input: Record<string, any>) {
    return this.authService.register(input as any);
  }

  @Mutation(() => GraphQLJSON)
  login(@Args('input', { type: () => GraphQLJSON }) input: Record<string, any>) {
    return this.authService.login(input as any);
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  logout(@Context('req') request: Request) {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    return this.authService.logout(token);
  }

  @Mutation(() => GraphQLJSON)
  forgotPassword(
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    return this.authService.forgotPassword(input as any);
  }

  @Mutation(() => GraphQLJSON)
  resetPassword(
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    return this.authService.resetPassword(input as any);
  }

  @Mutation(() => GraphQLJSON)
  verifyResetCode(
    @Args('input', { type: () => GraphQLJSON }) input: Record<string, any>,
  ) {
    return this.authService.verifyResetCode(input.email, input.code);
  }
}
