import { Field, Float, InputType, Int } from '@nestjs/graphql';
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

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '1997-05-14' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @Field(() => Sex, { nullable: true })
  @ApiPropertyOptional({ enum: Sex, example: Sex.Hombre })
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weightKg?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(260)
  heightCm?: number;

  @Field(() => ActivityLevel, { nullable: true })
  @ApiPropertyOptional({ enum: ActivityLevel, example: ActivityLevel.Moderado })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @Field(() => NutritionGoal, { nullable: true })
  @ApiPropertyOptional({ enum: NutritionGoal, example: NutritionGoal.Mantener })
  @IsOptional()
  @IsEnum(NutritionGoal)
  goal?: NutritionGoal;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '+593999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailNotificationsEnabled?: boolean;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  smsNotificationsEnabled?: boolean;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'https://example.com/profile.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImage?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 2000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalDailyCalories?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 120, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalProteinGrams?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 250, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalCarbsGrams?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 60, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalFatGrams?: number;

  @Field(() => Int, { nullable: true })
  @ApiPropertyOptional({ example: 30, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  goalFiberGrams?: number;

  @Field(() => [String], { nullable: true })
  @ApiPropertyOptional({ type: [String], example: ['mani', 'pescado'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedIngredients?: string[];

  @Field(() => [String], { nullable: true })
  @ApiPropertyOptional({ type: [String], example: ['lacteo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
