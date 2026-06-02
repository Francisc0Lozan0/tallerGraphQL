import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateNutritionTrackerDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  waterIntakeMl?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}