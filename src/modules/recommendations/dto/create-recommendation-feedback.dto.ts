import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class CreateRecommendationFeedbackDto {
  @Field()
  @IsString()
  recipeId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  prepared?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  feedback?: string;
}