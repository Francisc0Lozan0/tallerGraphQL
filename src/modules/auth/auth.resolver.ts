import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import {
  AuthResponse,
  ForgotPasswordResponse,
  LogoutResponse,
  VerifyResetCodeResponse,
} from './dto/auth-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  register(@Args('input') input: RegisterDto) {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  login(@Args('input') input: LoginDto) {
    return this.authService.login(input);
  }

  @Mutation(() => LogoutResponse)
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

  @Mutation(() => ForgotPasswordResponse)
  forgotPassword(@Args('input') input: ForgotPasswordDto) {
    return this.authService.forgotPassword(input);
  }

  @Mutation(() => AuthResponse)
  resetPassword(@Args('input') input: ResetPasswordDto) {
    return this.authService.resetPassword(input);
  }

  @Mutation(() => VerifyResetCodeResponse)
  verifyResetCode(@Args('input') input: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(input.email, input.code);
  }
}

