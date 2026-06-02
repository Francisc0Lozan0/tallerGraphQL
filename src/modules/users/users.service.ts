import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from './entities/user.entity';
import { NutritionService } from '../nutrition/nutrition.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly nutritionService: NutritionService,
  ) {}

  private generateId(): string {
    return randomBytes(12).toString('hex');
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.userRepository.count();
    return count === 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    if (user.goalFiberGrams == null) {
      const targets = this.nutritionService.calculateTargetsFromInputs({
        birthDate: user.birthDate,
        sex: user.sex,
        weightKg: Number(user.weightKg),
        heightCm: Number(user.heightCm),
        activityLevel: user.activityLevel,
        goal: user.goal,
      });

      user.goalDailyCalories = targets.maxDailyCalories;
      user.goalProteinGrams = targets.targetProtein;
      user.goalCarbsGrams = targets.targetCarbs;
      user.goalFatGrams = targets.targetFat;
      user.goalFiberGrams = targets.targetFiber;

      await this.userRepository.save(user);
    }

    await this.nutritionService.setProfileSetupComplete(
      user.id,
      this.hasCompleteNutritionProfile(user),
    );

    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const birthDate = userData.birthDate
      ? new Date(userData.birthDate as unknown as string)
      : undefined;

    const hasRequiredInputs =
      Boolean(birthDate) &&
      userData.sex != null &&
      userData.weightKg != null &&
      userData.heightCm != null &&
      userData.activityLevel != null &&
      userData.goal != null;

    const targetsMissing =
      userData.goalDailyCalories == null ||
      userData.goalProteinGrams == null ||
      userData.goalCarbsGrams == null ||
      userData.goalFatGrams == null ||
      userData.goalFiberGrams == null;

    const shouldCalculateTargets = hasRequiredInputs && targetsMissing;

    const calculatedTargets = shouldCalculateTargets
      ? this.nutritionService.calculateTargetsFromInputs({
          birthDate: birthDate as Date,
          sex: userData.sex as User['sex'],
          weightKg: Number(userData.weightKg),
          heightCm: Number(userData.heightCm),
          activityLevel: userData.activityLevel as User['activityLevel'],
          goal: userData.goal as User['goal'],
        })
      : null;

    const newUser = this.userRepository.create({
      id: this.generateId(),
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      birthDate: birthDate as Date,
      sex: userData.sex,
      weightKg: userData.weightKg,
      heightCm: userData.heightCm,
      activityLevel: userData.activityLevel,
      goal: userData.goal,
      email: userData.email || '',
      passwordHash: userData.passwordHash || '',
      phoneNumber: userData.phoneNumber ?? null,
      emailNotificationsEnabled: userData.emailNotificationsEnabled ?? false,
      smsNotificationsEnabled: userData.smsNotificationsEnabled ?? false,
      role: userData.role || 'user',
      goalDailyCalories:
        userData.goalDailyCalories ?? calculatedTargets?.maxDailyCalories ?? null,
      goalProteinGrams:
        userData.goalProteinGrams ?? calculatedTargets?.targetProtein ?? null,
      goalCarbsGrams:
        userData.goalCarbsGrams ?? calculatedTargets?.targetCarbs ?? null,
      goalFatGrams: userData.goalFatGrams ?? calculatedTargets?.targetFat ?? null,
      goalFiberGrams:
        userData.goalFiberGrams ?? calculatedTargets?.targetFiber ?? null,
    });
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(
    id: string,
    userData: UpdateUserDto | (Partial<User> & {
      birthDate?: string | Date;
      excludedIngredients?: string[];
      excludedCategories?: string[];
    }),
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    const { birthDate: birthDateValue, ...rest } = userData;
    const normalizedData: Partial<User> = {
      ...(rest as Partial<User>),
      ...(birthDateValue != null
        ? {
            birthDate:
              birthDateValue instanceof Date
                ? birthDateValue
                : new Date(birthDateValue),
          }
        : {}),
    };

    const merged = this.userRepository.merge(user, normalizedData);

    const shouldRecalculate =
      userData.birthDate !== undefined ||
      userData.sex !== undefined ||
      userData.weightKg !== undefined ||
      userData.heightCm !== undefined ||
      userData.activityLevel !== undefined ||
      userData.goal !== undefined;

    if (shouldRecalculate) {
      const targets = this.nutritionService.calculateTargetsFromInputs({
        birthDate: merged.birthDate,
        sex: merged.sex,
        weightKg: Number(merged.weightKg),
        heightCm: Number(merged.heightCm),
        activityLevel: merged.activityLevel,
        goal: merged.goal,
      });

      merged.goalDailyCalories = targets.maxDailyCalories;
      merged.goalProteinGrams = targets.targetProtein;
      merged.goalCarbsGrams = targets.targetCarbs;
      merged.goalFatGrams = targets.targetFat;
      merged.goalFiberGrams = targets.targetFiber;
    }

    const saved = await this.userRepository.save(merged);

    const shouldUpdateProfile =
      shouldRecalculate ||
      userData.excludedIngredients !== undefined ||
      userData.excludedCategories !== undefined;

    if (shouldUpdateProfile) {
      await this.nutritionService.upsertMyProfile(saved.id, {
        excludedIngredients: userData.excludedIngredients,
        excludedCategories: userData.excludedCategories,
        maxDailyCalories: shouldRecalculate ? saved.goalDailyCalories ?? undefined : undefined,
        targetProtein: shouldRecalculate ? saved.goalProteinGrams ?? undefined : undefined,
        targetCarbs: shouldRecalculate ? saved.goalCarbsGrams ?? undefined : undefined,
        targetFat: shouldRecalculate ? saved.goalFatGrams ?? undefined : undefined,
      });
    }

    const hasCompleteNutritionProfile = this.hasCompleteNutritionProfile(saved);

    await this.nutritionService.setProfileSetupComplete(
      saved.id,
      hasCompleteNutritionProfile,
    );

    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User | null> {
    const user = await this.findById(id);

    if (!user) {
      return null;
    }

    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);

    return this.findById(id);
  }

  private hasCompleteNutritionProfile(user: Pick<
    User,
    'birthDate' | 'sex' | 'weightKg' | 'heightCm' | 'activityLevel' | 'goal'
  >): boolean {
    return Boolean(
      user.birthDate &&
      user.sex != null &&
      user.weightKg != null &&
      user.heightCm != null &&
      user.activityLevel != null &&
      user.goal != null,
    );
  }
}
