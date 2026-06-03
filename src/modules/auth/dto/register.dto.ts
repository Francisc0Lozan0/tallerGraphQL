import { Field, Float, InputType } from '@nestjs/graphql';
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

@InputType()
export class RegisterDto {
  @Field()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @Field()
  @ApiProperty({ example: 'John' })
  @IsString()
  first_name!: string;

  @Field()
  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name!: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '+57 300 123 4567' })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @Field({ nullable: true })
  @ApiPropertyOptional({ example: '1997-05-14' })
  @IsOptional()
  @IsDateString()
  birth_date?: string;

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
  weight_kg?: number;

  @Field(() => Float, { nullable: true })
  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(260)
  height_cm?: number;

  @Field(() => ActivityLevel, { nullable: true })
  @ApiPropertyOptional({ enum: ActivityLevel, example: ActivityLevel.Moderado })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;

  @Field(() => NutritionGoal, { nullable: true })
  @ApiPropertyOptional({ enum: NutritionGoal, example: NutritionGoal.Mantener })
  @IsOptional()
  @IsEnum(NutritionGoal)
  goal?: NutritionGoal;

  @Field(() => DietType, { nullable: true })
  @ApiPropertyOptional({ enum: DietType, example: DietType.Sin_dieta })
  @IsOptional()
  @IsEnum(DietType)
  diet_type?: DietType;

  @Field(() => [String], { nullable: true })
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded_ingredients?: string[];

  @Field(() => [String], { nullable: true })
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded_categories?: string[];
}
