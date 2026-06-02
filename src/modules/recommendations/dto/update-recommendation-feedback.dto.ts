import { PartialType } from '@nestjs/swagger';
import { CreateRecommendationFeedbackDto } from './create-recommendation-feedback.dto';

export class UpdateRecommendationFeedbackDto extends PartialType(
  CreateRecommendationFeedbackDto,
) {}
