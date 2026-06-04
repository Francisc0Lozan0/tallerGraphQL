import { InputType, PartialType } from '@nestjs/graphql';
import { CreateRecommendationFeedbackDto } from './create-recommendation-feedback.dto';

@InputType()
export class UpdateRecommendationFeedbackDto extends PartialType(
  CreateRecommendationFeedbackDto,
) {}
