import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { RevokedToken } from './entities/revoked-token.entity';
import { MoreThan, Repository } from 'typeorm';
import { EmailService } from './services/email.service';
import { ConfigService } from '@nestjs/config';
import { NutritionService } from '../nutrition/nutrition.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    private nutritionService: NutritionService,
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      birth_date,
      sex,
      weight_kg,
      height_cm,
      activity_level,
      goal,
      diet_type,
      excluded_ingredients,
      excluded_categories,
    } = registerDto;
    const birthDateValue = birth_date ? new Date(birth_date) : undefined;
    const hasProfileInputs =
      Boolean(birthDateValue) &&
      sex != null &&
      weight_kg != null &&
      height_cm != null &&
      activity_level != null &&
      goal != null;
    const isFirstUser = await this.usersService.isEmpty();

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nutritionTargets = hasProfileInputs
      ? this.nutritionService.calculateTargetsFromInputs({
          birthDate: birthDateValue as Date,
          sex,
          weightKg: weight_kg,
          heightCm: height_cm,
          activityLevel: activity_level,
          goal,
        })
      : null;

    const user = await this.usersService.create({
      email,
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone_number?.trim() || null,
      birthDate: birthDateValue,
      sex,
      weightKg: weight_kg,
      heightCm: height_cm,
      activityLevel: activity_level,
      goal,
      goalDailyCalories: nutritionTargets?.maxDailyCalories ?? null,
      goalProteinGrams: nutritionTargets?.targetProtein ?? null,
      goalCarbsGrams: nutritionTargets?.targetCarbs ?? null,
      goalFatGrams: nutritionTargets?.targetFat ?? null,
      goalFiberGrams: nutritionTargets?.targetFiber ?? null,
      passwordHash: hashedPassword,
      role: isFirstUser ? 'admin' : 'user',
    });

    await this.nutritionService.upsertMyProfile(user.id, {
      dietType: diet_type,
      excludedIngredients: excluded_ingredients,
      excludedCategories: excluded_categories,
      maxDailyCalories: nutritionTargets?.maxDailyCalories,
      targetProtein: nutritionTargets?.targetProtein,
      targetCarbs: nutritionTargets?.targetCarbs,
      targetFat: nutritionTargets?.targetFat,
    });

    if (hasProfileInputs) {
      await this.nutritionService.setProfileSetupComplete(user.id, true);
    }

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async logout(token: string) {
    const tokenHash = this.hashToken(token);

    const existing = await this.revokedTokenRepository.findOneBy({ tokenHash });

    if (!existing) {
      const decoded = this.jwtService.decode(token) as { exp?: number } | null;
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date();

      const revokedToken = this.revokedTokenRepository.create({
        id: this.generateId(),
        tokenHash,
        expiresAt,
      });

      await this.revokedTokenRepository.save(revokedToken);
    }

    return { message: 'Logged out successfully' };
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);

    const revokedToken = await this.revokedTokenRepository.findOne({
      where: {
        tokenHash,
        expiresAt: MoreThan(new Date()),
      },
    });

    return Boolean(revokedToken);
  }

  private generateResetCode(): string {
    // Generar código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Esta cuenta no existe');
    }

    // Generar código de 6 dígitos
    const resetCode = this.generateResetCode();
    
    // Guardar el código con expiración de 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    user.resetCode = resetCode;
    user.resetCodeExpiresAt = expiresAt;
    await this.usersService.update(user.id, user);

    // Enviar email con el código
    await this.emailService.sendPasswordResetCode(email, resetCode);

    return { message: 'Código de recuperación enviado correctamente' };
  }

  async verifyResetCode(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verificar si el código existe y no ha expirado
    if (!user.resetCode || user.resetCode !== normalizedCode) {
      throw new BadRequestException('Invalid reset code');
    }

    if (!user.resetCodeExpiresAt || user.resetCodeExpiresAt < new Date()) {
      throw new BadRequestException('Reset code has expired');
    }

    // Generar token temporal para el reset de contraseña (30 minutos)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset_verified' },
      { expiresIn: '30m' }
    );

    // Limpiar el código de la BD
    user.resetCode = null;
    user.resetCodeExpiresAt = null;
    await this.usersService.update(user.id, user);

    return {
      resetToken,
      message: 'Reset code verified successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Validar token JWT
      const decoded = this.jwtService.verify(token) as { sub: string; type: string };

      if (decoded.type !== 'reset_verified') {
        throw new BadRequestException('Invalid reset token');
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await this.usersService.updatePassword(user.id, hashedPassword);

      // Generar tokens de autenticación y retornar para auto-login
      const updatedUser = await this.usersService.findById(user.id);
      if (!updatedUser) {
        throw new UnauthorizedException('User not found after update');
      }

      return this.generateTokens(updatedUser);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
