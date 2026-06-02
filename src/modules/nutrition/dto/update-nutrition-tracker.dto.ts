import { PartialType } from '@nestjs/swagger';
import { CreateNutritionTrackerDto } from './create-nutrition-tracker.dto';

export class UpdateNutritionTrackerDto extends PartialType(
  CreateNutritionTrackerDto,
) {}
