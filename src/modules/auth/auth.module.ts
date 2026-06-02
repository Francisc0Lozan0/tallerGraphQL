import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { EmailService } from './services/email.service';
import { RevokedToken } from './entities/revoked-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NutritionModule } from '../nutrition/nutrition.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    NutritionModule,
    PassportModule,
    TypeOrmModule.forFeature([RevokedToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRATION')?.trim() || '1d';

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService, AuthResolver],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
