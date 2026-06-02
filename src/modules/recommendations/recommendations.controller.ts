import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateRecommendationFeedbackDto } from "./dto/create-recommendation-feedback.dto";
import { UpdateRecommendationFeedbackDto } from "./dto/update-recommendation-feedback.dto";
import { RecommendationsService } from "./recommendations.service";

@ApiTags("recommendations")
@ApiBearerAuth()
@Controller("recommendations")
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  @ApiBody({ type: CreateRecommendationFeedbackDto })
  @ApiOperation({ summary: "Create recommendation feedback" })
  @ApiResponse({ status: 201, description: "Feedback created" })
  create(
    @Req() request: any,
    @Body() createRecommendationFeedbackDto: CreateRecommendationFeedbackDto,
  ) {
    const userId = request.user?.id;
    if (!userId) throw new UnauthorizedException("User not found");

    return this.recommendationsService.create(userId, createRecommendationFeedbackDto);
  }

  @Get("suggest")
  @ApiOperation({ summary: "Get smart recipe recommendations" })
  @ApiQuery({
    name: "date",
    required: true,
    description: "YYYY-MM-DD for tracking context",
  })
  @ApiQuery({
    name: "strict",
    required: false,
    type: Boolean,
    description: "Only recommend what can be cooked with current inventory",
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "query", required: false, description: "Texto para buscar por nombre" })
  @ApiQuery({ name: "q", required: false, description: "Alias de query" })
  @ApiResponse({ status: 200, description: "Recommendations returned" })
  async getRecommendations(
    @Req() request: any,
    @Query("date") date: string,
    @Query("strict") strict?: string,
    @Query("limit") limit?: string,
    @Query("query") query?: string,
    @Query("q") q?: string,
    @Query("mealType") mealType?: string,
    @Query("cuisine") cuisine?: string,
    @Query("restrictions") restrictions?: string,
    @Query("prepTime") prepTime?: string,
    @Query("budget") budget?: string,
    @Query("nutrition") nutrition?: string,
    @Query("difficulty") difficulty?: string,
    @Query("ingredient") ingredient?: string,
    @Query("excludeIngredients") excludeIngredients?: string,
    @Query("objective") objective?: string,
    @Query("dessert") dessert?: string,
    @Query("bakery") bakery?: string,
    @Query("beverage") beverage?: string,
  ) {
    const userId = request.user?.id;
    if (!userId) throw new UnauthorizedException("User not found");

    const isStrict = strict === "true";
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.recommendationsService.getRecommendations(
      userId,
      isStrict,
      date,
      limitNum,
      query ?? q,
      {
        mealType,
        cuisine,
        restrictions,
        prepTime,
        budget,
        nutrition,
        difficulty,
        ingredient,
        excludeIngredients,
        objective,
        dessert,
        bakery,
        beverage,
      },
    );
  }
  

  @Get()
  @ApiOperation({ summary: "List recommendation feedback" })
  @ApiQuery({ name: "recipeId", required: false })
  @ApiResponse({ status: 200, description: "Feedback list returned" })
  findAll(@Query("recipeId") recipeId?: string) {
    return this.recommendationsService.findAll(recipeId);
  }

  @Get("top-rated")
  @ApiOperation({ summary: "Get top rated recommendation feedback" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Top rated feedback returned" })
  getTopRated(
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.recommendationsService.getTopRated(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get recommendation feedback by id" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Feedback found" })
  @ApiResponse({ status: 404, description: "Feedback not found" })
  findOne(@Param("id") id: string) {
    return this.recommendationsService.findOne(id);
  }

  @Patch(":id")
  @ApiBody({ type: UpdateRecommendationFeedbackDto })
  @ApiOperation({ summary: "Update recommendation feedback" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Feedback updated" })
  @ApiResponse({ status: 404, description: "Feedback not found" })
  update(
    @Param("id") id: string,
    @Body() updateRecommendationFeedbackDto: UpdateRecommendationFeedbackDto,
  ) {
    return this.recommendationsService.update(
      id,
      updateRecommendationFeedbackDto,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete recommendation feedback" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Feedback removed" })
  @ApiResponse({ status: 404, description: "Feedback not found" })
  remove(@Param("id") id: string) {
    return this.recommendationsService.remove(id);
  }
}
