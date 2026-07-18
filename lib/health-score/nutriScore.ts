import type {
  NutritionFacts,
  HealthGrade,
  ComponentScore,
  HealthScoreBreakdown,
  HealthScoreResult,
} from "./types";

// Nutri-Score-inspired formula, scaled to a single serving rather than
// per-100g. Thresholds are banded 0/2/4/6/8/10 (negatives) and 0/1/2/3/4/5
// (positives), mirroring the shape of the real Nutri-Score algorithm.

function bandScore(value: number, thresholds: number[], points: number[]): ComponentScore {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      return { value, points: points[i] };
    }
  }
  return { value, points: points[points.length - 1] };
}

const NEGATIVE_POINTS = [0, 2, 4, 6, 8, 10];
const POSITIVE_POINTS = [0, 1, 2, 3, 4, 5];

function scoreCalories(kcal: number): ComponentScore {
  return bandScore(kcal, [160, 240, 320, 400, 480], NEGATIVE_POINTS);
}

function scoreSugar(g: number): ComponentScore {
  return bandScore(g, [4.5, 9, 13.5, 18, 22.5], NEGATIVE_POINTS);
}

function scoreSaturatedFat(g: number): ComponentScore {
  return bandScore(g, [1, 2, 3, 4, 5], NEGATIVE_POINTS);
}

function scoreSodium(mg: number): ComponentScore {
  return bandScore(mg, [90, 180, 270, 360, 450], NEGATIVE_POINTS);
}

function scoreFiber(g: number): ComponentScore {
  return bandScore(g, [0.9, 1.9, 2.8, 3.7, 4.7], POSITIVE_POINTS);
}

function scoreProtein(g: number): ComponentScore {
  return bandScore(g, [1.6, 3.2, 4.8, 6.4, 8.0], POSITIVE_POINTS);
}

function gradeForNetScore(netScore: number): HealthGrade {
  if (netScore <= 0) return "A";
  if (netScore <= 4) return "B";
  if (netScore <= 9) return "C";
  if (netScore <= 15) return "D";
  return "E";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeHealthScore(facts: NutritionFacts): HealthScoreResult {
  const calories = scoreCalories(facts.calories);
  const sugar = scoreSugar(facts.sugarG);
  const saturatedFat = scoreSaturatedFat(facts.saturatedFatG);
  const sodium = scoreSodium(facts.sodiumMg);
  const fiber = scoreFiber(facts.fiberG);
  const protein = scoreProtein(facts.proteinG);

  const negativePoints = calories.points + sugar.points + saturatedFat.points + sodium.points;
  const positivePoints = fiber.points + protein.points;

  // Mirrors real Nutri-Score's anti-junk-food rule: protein/fiber only
  // offset the negative points once the food is already "bad enough" —
  // otherwise a high-protein, high-sugar snack could score as healthy.
  const positivePointsCounted = negativePoints >= 11;
  const netScore = positivePointsCounted
    ? negativePoints - positivePoints
    : negativePoints;

  const breakdown: HealthScoreBreakdown = {
    calories,
    sugar,
    saturatedFat,
    sodium,
    fiber,
    protein,
    negativePoints,
    positivePoints,
    positivePointsCounted,
    netScore,
  };

  return {
    grade: gradeForNetScore(netScore),
    score0to100: Math.round(100 - clamp(netScore, 0, 40) * 2.5),
    breakdown,
  };
}

// Human-readable reasons behind a grade, ranked most-impactful first, so the
// UI can explain a score rather than showing an opaque letter.
export function explainHealthScore(breakdown: HealthScoreBreakdown): string[] {
  const reasons: string[] = [];

  if (breakdown.sodium.points >= 6) reasons.push("High in sodium");
  if (breakdown.sugar.points >= 6) reasons.push("High in sugar");
  if (breakdown.saturatedFat.points >= 6) reasons.push("High in saturated fat");
  if (breakdown.calories.points >= 6) reasons.push("High in calories");

  if (breakdown.positivePointsCounted) {
    if (breakdown.fiber.points >= 3) reasons.push("Good source of fiber");
    if (breakdown.protein.points >= 3) reasons.push("Good source of protein");
  }

  if (reasons.length === 0) {
    reasons.push("Well balanced across calories, sugar, fat, and sodium");
  }

  return reasons;
}
