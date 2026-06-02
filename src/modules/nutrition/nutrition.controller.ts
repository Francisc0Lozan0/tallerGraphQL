import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateNutritionGoalDto } from "./dto/create-nutrition-goal.dto";
import { CreateNutritionTrackerDto } from "./dto/create-nutrition-tracker.dto";
import { NutritionProfileDto } from "./dto/nutritionProfile.dto";
import { UpdateNutritionGoalDto } from "./dto/update-nutrition-goal.dto";
import { UpdateNutritionTrackerDto } from "./dto/update-nutrition-tracker.dto";
import { NutritionService } from "./nutrition.service";

interface RequestWithUser {
  user?: {
    id?: string;
  };
}

@ApiTags("nutrition")
@ApiBearerAuth()
@Controller("nutrition")
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get my nutrition profile" })
  @ApiResponse({ status: 200, description: "Nutrition profile returned" })
  getMyProfile(@Req() request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.nutritionService.getMyProfile(userId);
  }

  @Put("profile")
  @ApiBody({ type: NutritionProfileDto })
  @ApiOperation({ summary: "Create/update my nutrition profile" })
  @ApiResponse({ status: 200, description: "Nutrition profile saved" })
  upsertMyProfile(
    @Req() request: RequestWithUser,
    @Body() body: NutritionProfileDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.upsertMyProfile(userId, body);
  }

  // --- NUTRITION TRACKER ---

  @Post("tracker")
  @ApiBody({ type: CreateNutritionTrackerDto })
  @ApiOperation({
    summary: "Create a nutrition tracker log for a specific date",
  })
  createTracker(
    @Req() request: RequestWithUser,
    @Body() body: CreateNutritionTrackerDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.createTracker(userId, body);
  }

  @Get("tracker")
  @ApiOperation({ summary: "Get nutrition tracker by date" })
  @ApiQuery({ name: "date", required: true, description: "YYYY-MM-DD" })
  getTrackerByDate(
    @Req() request: RequestWithUser,
    @Query("date") date: string,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.findTrackerByDate(userId, date);
  }

  @Patch("tracker/:id")
  @ApiBody({ type: UpdateNutritionTrackerDto })
  @ApiOperation({ summary: "Update nutrition tracker" })
  updateTracker(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
    @Body() body: UpdateNutritionTrackerDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.updateTracker(id, userId, body);
  }

  // --- NUTRITION GOALS ---

  @Post("goal")
  @ApiBody({ type: CreateNutritionGoalDto })
  @ApiOperation({ summary: "Create a new nutrition goal" })
  createGoal(
    @Req() request: RequestWithUser,
    @Body() body: CreateNutritionGoalDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.createGoal(userId, body);
  }

  @Get("goal/active")
  @ApiOperation({ summary: "Get current active nutrition goal" })
  getActiveGoal(@Req() request: RequestWithUser) {
    const userId = this.getUserId(request);
    return this.nutritionService.getActiveGoal(userId);
  }

  @Patch("goal/:id")
  @ApiBody({ type: UpdateNutritionGoalDto })
  @ApiOperation({ summary: "Update nutrition goal" })
  updateGoal(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
    @Body() body: UpdateNutritionGoalDto,
  ) {
    const userId = this.getUserId(request);
    return this.nutritionService.updateGoal(id, userId, body);
  }

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException("Authenticated user not found");
    }
    return userId;
  }
}
