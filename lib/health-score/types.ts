export interface NutritionFacts {
  calories: number;
  sugarG: number;
  saturatedFatG: number;
  sodiumMg: number;
  fiberG: number;
  proteinG: number;
}

export type HealthGrade = "A" | "B" | "C" | "D" | "E";

export interface ComponentScore {
  value: number;
  points: number;
}

export interface HealthScoreBreakdown {
  calories: ComponentScore;
  sugar: ComponentScore;
  saturatedFat: ComponentScore;
  sodium: ComponentScore;
  fiber: ComponentScore;
  protein: ComponentScore;
  negativePoints: number;
  positivePoints: number;
  positivePointsCounted: boolean;
  netScore: number;
}

export interface HealthScoreResult {
  grade: HealthGrade;
  score0to100: number;
  breakdown: HealthScoreBreakdown;
}
