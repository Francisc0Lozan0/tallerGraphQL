import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class CreateNutritionTrackerDto {
  @Field()
  @IsDateString()
  date: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  waterIntakeMl?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}