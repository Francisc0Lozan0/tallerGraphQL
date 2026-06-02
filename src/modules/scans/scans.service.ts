import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';
import { FOOD_RULES, FoodRule, UNKNOWN_FOOD } from './food-rules';
import * as path from 'path';

@Injectable()
export class ScansService {

private client = (() => {
  const envVal = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  try {
    const trimmed = envVal.trim();
    if (trimmed.startsWith('{')) {
      const creds = JSON.parse(trimmed);
      return new vision.ImageAnnotatorClient({ credentials: creds as any });
    }
  } catch (e) {
    // fallthrough to keyFilename
  }

  const keyPath = envVal ? path.join(process.cwd(), envVal) : undefined;
  return new vision.ImageAnnotatorClient(keyPath ? { keyFilename: keyPath } : {});
})();
  async analyzeImage(buffer: Buffer) {
    const [result] = await this.client.labelDetection({
      image: { content: buffer },
    });

    const labels =
      result.labelAnnotations
        ?.map((l) => l.description)
        .filter((description): description is string => Boolean(description))
        .map((description) => this.normalizeText(description)) || [];

    const detected = this.detectFood(labels);

    return {
      labels,
      detected,
    };
  }

  private detectFood(labels: string[]) {
    let bestMatch: FoodRule | null = null;
    let bestScore = 0;

    for (const food of FOOD_RULES) {
      const score = food.keywords.reduce((acc, keyword) => {
        const normalizedKeyword = this.normalizeText(keyword);
        const hasMatch = labels.some((label) =>
          label.includes(normalizedKeyword),
        );

        return hasMatch ? acc + 1 : acc;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = food;
      }
    }

    if (bestMatch && bestScore > 0) {
      return {
        name: bestMatch.name,
        category: bestMatch.category,
      };
    }

    return UNKNOWN_FOOD;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}