import { describe, expect, it } from "vitest";
import { computeHealthScore, explainHealthScore } from "./nutriScore";

describe("computeHealthScore", () => {
  it("grades a light, high-fiber, high-protein meal as A", () => {
    const result = computeHealthScore({
      calories: 150,
      sugarG: 2,
      saturatedFatG: 0.5,
      sodiumMg: 80,
      fiberG: 6,
      proteinG: 20,
    });

    expect(result.grade).toBe("A");
    expect(result.score0to100).toBe(100);
  });

  it("grades a calorie-dense, sugary, high-sodium meal as E", () => {
    const result = computeHealthScore({
      calories: 900,
      sugarG: 40,
      saturatedFatG: 15,
      sodiumMg: 1200,
      fiberG: 0,
      proteinG: 0,
    });

    expect(result.grade).toBe("E");
    expect(result.score0to100).toBe(0);
  });

  it("does not let high protein rescue a food that isn't bad enough to trigger the offset", () => {
    // negativePoints just under the 11-point threshold: positives are not
    // subtracted, matching the real Nutri-Score's anti-junk-food rule.
    const result = computeHealthScore({
      calories: 320, // 4 pts
      sugarG: 9, // 2 pts
      saturatedFatG: 2, // 2 pts
      sodiumMg: 180, // 2 pts -> negativePoints = 10, below the 11 threshold
      fiberG: 10, // would be 5 pts if counted
      proteinG: 30, // would be 5 pts if counted
    });

    expect(result.breakdown.negativePoints).toBe(10);
    expect(result.breakdown.positivePointsCounted).toBe(false);
    expect(result.breakdown.netScore).toBe(10);
    expect(result.grade).toBe("D");
  });

  it("does let protein/fiber offset once negative points reach the threshold", () => {
    const result = computeHealthScore({
      calories: 480, // 8 pts
      sugarG: 18, // 6 pts
      saturatedFatG: 3, // 4 pts -> negativePoints already 18 before sodium
      sodiumMg: 90, // 0 pts -> negativePoints = 18
      fiberG: 10, // 5 pts
      proteinG: 30, // 5 pts
    });

    expect(result.breakdown.negativePoints).toBe(18);
    expect(result.breakdown.positivePointsCounted).toBe(true);
    expect(result.breakdown.netScore).toBe(8); // 18 - (5 + 5)
    expect(result.grade).toBe("C");
  });

  it("is monotonic: strictly more sodium never improves the grade", () => {
    const base = { calories: 300, sugarG: 5, saturatedFatG: 2, sodiumMg: 200, fiberG: 2, proteinG: 10 };
    const saltier = { ...base, sodiumMg: 500 };

    const baseResult = computeHealthScore(base);
    const saltierResult = computeHealthScore(saltier);

    expect(saltierResult.breakdown.netScore).toBeGreaterThanOrEqual(baseResult.breakdown.netScore);
  });

  it("clamps score0to100 to a 0-100 range even for extreme inputs", () => {
    const result = computeHealthScore({
      calories: 5000,
      sugarG: 200,
      saturatedFatG: 50,
      sodiumMg: 5000,
      fiberG: 0,
      proteinG: 0,
    });

    expect(result.score0to100).toBeGreaterThanOrEqual(0);
    expect(result.score0to100).toBeLessThanOrEqual(100);
  });
});

describe("explainHealthScore", () => {
  it("flags high sodium as a reason for a salty meal", () => {
    const { breakdown } = computeHealthScore({
      calories: 200,
      sugarG: 2,
      saturatedFatG: 1,
      sodiumMg: 900,
      fiberG: 2,
      proteinG: 10,
    });

    expect(explainHealthScore(breakdown)).toContain("High in sodium");
  });

  it("falls back to a balanced message when nothing stands out", () => {
    const { breakdown } = computeHealthScore({
      calories: 150,
      sugarG: 2,
      saturatedFatG: 0.5,
      sodiumMg: 80,
      fiberG: 0.5,
      proteinG: 1,
    });

    expect(explainHealthScore(breakdown)).toEqual([
      "Well balanced across calories, sugar, fat, and sodium",
    ]);
  });
});
