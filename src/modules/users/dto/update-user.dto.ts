import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { ActivityLevel, NutritionGoal, Sex } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '1997-05-14' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Sex, example: Sex.Hombre })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weightKg?: number;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(260)
  heightCm?: number;

  @ApiPropertyOptional({ enum: ActivityLevel, example: ActivityLevel.Moderado })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiPropertyOptional({ enum: NutritionGoal, example: NutritionGoal.Mantener })
  @IsOptional()
  @IsEnum(NutritionGoal)
  goal?: NutritionGoal;

  @ApiPropertyOptional({ example: '+593999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailNotificationsEnabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  smsNotificationsEnabled?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/profile.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImage?: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;

  @ApiPropertyOptional({ example: 2000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalDailyCalories?: number;

  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalProteinGrams?: number;

  @ApiPropertyOptional({ example: 250, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalCarbsGrams?: number;

  @ApiPropertyOptional({ example: 60, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalFatGrams?: number;

  @ApiPropertyOptional({ example: 30, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalFiberGrams?: number;

  @ApiPropertyOptional({ type: [String], example: ['mani', 'pescado'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedIngredients?: string[];

  @ApiPropertyOptional({ type: [String], example: ['lacteo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
