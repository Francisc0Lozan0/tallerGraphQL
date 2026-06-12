import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { CreateNutritionTrackerDto } from './dto/create-nutrition-tracker.dto';
import { NutritionProfileDto } from './dto/nutritionProfile.dto';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto';
import { UpdateNutritionTrackerDto } from './dto/update-nutrition-tracker.dto';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { NutritionTracker } from './entities/nutrition-tracker.entity';
import { DietType, NutritionProfile } from './entities/nutritionProfile.entity';
import { ActivityLevel, NutritionGoal as UserGoal, Sex } from '../users/entities/user.entity';

export interface NutritionCalculationInput {
  birthDate: Date | string;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: UserGoal;
}

export interface NutritionTargets {
  maxDailyCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
}

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionProfile)
    private readonly repo: Repository<NutritionProfile>,
    @InjectRepository(NutritionTracker)
    private readonly trackerRepo: Repository<NutritionTracker>,
    @InjectRepository(NutritionGoal)
    private readonly goalRepo: Repository<NutritionGoal>,
  ) {}

  async getMyProfile(userId: string): Promise<NutritionProfile> {
    return this.findOrCreateByUserId(userId);
  }

  async upsertMyProfile(
    userId: string,
    dto: NutritionProfileDto,
  ): Promise<NutritionProfile> {
    const profile = await this.findOrCreateByUserId(userId);

    profile.dietType = dto.dietType ?? profile.dietType ?? DietType.Sin_dieta;
    profile.excludedIngredients =
      dto.excludedIngredients ?? profile.excludedIngredients ?? [];
    profile.excludedCategories =
      dto.excludedCategories ?? profile.excludedCategories ?? [];
    profile.maxDailyCalories =
      dto.maxDailyCalories ?? profile.maxDailyCalories ?? null;
    profile.targetProtein = dto.targetProtein ?? profile.targetProtein ?? null;
    profile.targetCarbs = dto.targetCarbs ?? profile.targetCarbs ?? null;
    profile.targetFat = dto.targetFat ?? profile.targetFat ?? null;

    return this.repo.save(profile);
  }

  async setProfileSetupComplete(
    userId: string,
    isComplete: boolean,
  ): Promise<NutritionProfile> {
    const profile = await this.findOrCreateByUserId(userId);

    if (isComplete && !profile.isSetupComplete) {
      profile.isSetupComplete = true;
      return this.repo.save(profile);
    }

    if (!isComplete && profile.isSetupComplete) {
      profile.isSetupComplete = false;
      return this.repo.save(profile);
    }

    return profile;
  }

  calculateTargetsFromInputs(input: NutritionCalculationInput): NutritionTargets {
    const age = this.calculateAge(input.birthDate);
    const bmr = this.calculateBmr(
      input.sex,
      input.weightKg,
      input.heightCm,
      age,
    );
    const tdee = bmr * this.getActivityFactor(input.activityLevel);
    const adjustedCalories = tdee + this.getGoalAdjustment(input.goal);
    const maxDailyCalories = this.clamp(Math.round(adjustedCalories), 800, 6000);

    const macroTargets = this.calculateMacroTargets(maxDailyCalories);

    return {
      maxDailyCalories,
      targetProtein: macroTargets.targetProtein,
      targetCarbs: macroTargets.targetCarbs,
      targetFat: macroTargets.targetFat,
      targetFiber: macroTargets.targetFiber,
    };
  }

  async findByUserId(userId: string): Promise<NutritionProfile | null> {
    return this.repo.findOneBy({ userId });
  }

  private async findOrCreateByUserId(
    userId: string,
  ): Promise<NutritionProfile> {
    const existing = await this.repo.findOneBy({ userId });
    if (existing) {
      return existing;
    }

    const created = this.repo.create({
      id: randomUUID(),
      userId,
      dietType: DietType.Sin_dieta,
      excludedIngredients: [],
      excludedCategories: [],
      maxDailyCalories: null,
      targetProtein: null,
      targetCarbs: null,
      targetFat: null,
      isSetupComplete: false,
    });

    return this.repo.save(created);
  }

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  private async findOrCreateTrackerByDate(userId: string, date: Date): Promise<NutritionTracker> {
    const existing = await this.trackerRepo.findOneBy({ userId, date });
    if (existing) {
      return existing;
    }

    const tracker = this.trackerRepo.create({
      id: this.generateId(),
      userId,
      date,
      waterIntakeMl: 0,
      notes: null,
    });

    return this.trackerRepo.save(tracker);
  }

  private calculateAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())
    ) {
      age -= 1;
    }
    return Math.max(age, 0);
  }

  private calculateBmr(
    sex: Sex,
    weightKg: number,
    heightCm: number,
    age: number,
  ): number {
    if (sex === Sex.Hombre) {
      return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    }
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }

  private getActivityFactor(level: ActivityLevel): number {
    switch (level) {
      case ActivityLevel.Sedentario:
        return 1.2;
      case ActivityLevel.Ligero:
        return 1.375;
      case ActivityLevel.Moderado:
        return 1.55;
      case ActivityLevel.Activo:
        return 1.725;
      case ActivityLevel.MuyActivo:
        return 1.9;
      default:
        return 1.2;
    }
  }

  private getGoalAdjustment(goal: UserGoal): number {
    switch (goal) {
      case UserGoal.Bajar:
        return -500;
      case UserGoal.Subir:
        return 500;
      case UserGoal.Mantener:
      default:
        return 0;
    }
  }

  private calculateMacroTargets(calories: number): {
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    targetFiber: number;
  } {
    const proteinCalories = calories * 0.3;
    const carbCalories = calories * 0.4;
    const fatCalories = calories * 0.3;
    const fiberGrams = Math.round((calories / 1000) * 14);

    return {
      targetProtein: Math.round(proteinCalories / 4),
      targetCarbs: Math.round(carbCalories / 4),
      targetFat: Math.round(fatCalories / 9),
      targetFiber: fiberGrams,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  // --- NUTRITION TRACKER ---

  async createTracker(userId: string, dto: CreateNutritionTrackerDto): Promise<NutritionTracker> {
    const existing = await this.trackerRepo.findOneBy({ userId, date: new Date(dto.date) });
    if (existing) {
      return existing; // Or throw error based on business logic, I'll return existing
    }

    const tracker = this.trackerRepo.create({
      id: this.generateId(),
      userId,
      date: new Date(dto.date),
      waterIntakeMl: dto.waterIntakeMl || 0,
      notes: dto.notes || null,
    });
    return this.trackerRepo.save(tracker);
  }

  async findTrackerByDate(userId: string, date: string): Promise<NutritionTracker> {
    const tracker = await this.trackerRepo.findOneBy({ userId, date: new Date(date) });
    if (!tracker) {
      throw new NotFoundException('Nutrition tracker no encontrado para esta fecha.');
    }
    return tracker;
  }

  async updateTracker(id: string, userId: string, dto: UpdateNutritionTrackerDto): Promise<NutritionTracker> {
    const tracker = await this.trackerRepo.findOneBy({ id, userId });
    if (!tracker) {
      throw new NotFoundException('Nutrition tracker no encontrado.');
    }

    if (dto.waterIntakeMl !== undefined) {
      tracker.waterIntakeMl = dto.waterIntakeMl;
    }
    if (dto.notes !== undefined) {
      tracker.notes = dto.notes;
    }
    
    return this.trackerRepo.save(tracker);
  }

  async addMacroConsumption(
    id: string,
    userId: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
  ): Promise<NutritionTracker> {
    const tracker = await this.trackerRepo.findOneBy({ id, userId });
    if (!tracker) {
      throw new NotFoundException('Nutrition tracker no encontrado para añadir consumo.');
    }

    tracker.totalCalories = Number(tracker.totalCalories) + calories;
    tracker.totalProtein = Number(tracker.totalProtein) + protein;
    tracker.totalCarbohydrates = Number(tracker.totalCarbohydrates) + carbs;
    tracker.totalFat = Number(tracker.totalFat) + fat;
    tracker.totalFiber = Number(tracker.totalFiber) + fiber;

    return this.trackerRepo.save(tracker);
  }

  async addMacroConsumptionByDate(
    userId: string,
    dateKey: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
  ): Promise<NutritionTracker> {
    const trackerDate = new Date(dateKey);
    const tracker = await this.findOrCreateTrackerByDate(userId, trackerDate);

    tracker.totalCalories = Number(tracker.totalCalories) + calories;
    tracker.totalProtein = Number(tracker.totalProtein) + protein;
    tracker.totalCarbohydrates = Number(tracker.totalCarbohydrates) + carbs;
    tracker.totalFat = Number(tracker.totalFat) + fat;
    tracker.totalFiber = Number(tracker.totalFiber) + fiber;

    return this.trackerRepo.save(tracker);
  }

  // --- NUTRITION GOALS ---

  async createGoal(userId: string, dto: CreateNutritionGoalDto): Promise<NutritionGoal> {
    // Optionally deactivate previous active goals
    await this.goalRepo.update({ userId, isActive: true }, { isActive: false, endDate: new Date() });

    const goal = this.goalRepo.create({
      id: this.generateId(),
      userId,
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.goalRepo.save(goal);
  }

  async getActiveGoal(userId: string): Promise<NutritionGoal> {
    const goal = await this.goalRepo.findOneBy({ userId, isActive: true });
    if (!goal) {
      throw new NotFoundException('No hay meta nutricional activa.');
    }
    return goal;
  }

  async updateGoal(id: string, userId: string, dto: UpdateNutritionGoalDto): Promise<NutritionGoal> {
    const goal = await this.goalRepo.findOneBy({ id, userId });
    if (!goal) {
      throw new NotFoundException('Nutrition goal no encontrado.');
    }

    Object.assign(goal, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : goal.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : goal.endDate,
    });

    return this.goalRepo.save(goal);
  }





  //
}
