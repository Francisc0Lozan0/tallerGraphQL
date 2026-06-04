import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateNutritionTrackerDto } from './create-nutrition-tracker.dto';

@InputType()
export class UpdateNutritionTrackerDto extends PartialType(CreateNutritionTrackerDto) {
  @Field({ nullable: true })
  date?: string;

  @Field(() => Int, { nullable: true })
  waterIntakeMl?: number;

  @Field({ nullable: true })
  notes?: string;
}
