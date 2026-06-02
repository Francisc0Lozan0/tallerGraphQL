import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRecommendationFeedbackDto {
  @IsString()
  recipeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsBoolean()
  prepared?: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;
}