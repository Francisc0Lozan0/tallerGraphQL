import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { DietType } from '../../nutrition/entities/nutritionProfile.entity';
import { ActivityLevel, NutritionGoal, Sex } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name!: string;

  @ApiPropertyOptional({ example: '+57 300 123 4567' })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({ example: '1997-05-14' })
  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @ApiPropertyOptional({ enum: Sex, example: Sex.Hombre })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight_kg?: number;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(260)
  height_cm?: number;

  @ApiPropertyOptional({ enum: ActivityLevel, example: ActivityLevel.Moderado })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;

  @ApiPropertyOptional({ enum: NutritionGoal, example: NutritionGoal.Mantener })
  @IsOptional()
  @IsEnum(NutritionGoal)
  goal?: NutritionGoal;

  @ApiPropertyOptional({ enum: DietType, example: DietType.Sin_dieta })
  @IsOptional()
  @IsEnum(DietType)
  diet_type?: DietType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded_ingredients?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded_categories?: string[];
}
