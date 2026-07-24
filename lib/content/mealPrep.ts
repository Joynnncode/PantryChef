import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type MealPrepCategory =
  | "protein"
  | "grain"
  | "vegetable"
  | "full-meal"
  | "sauce-condiment"
  | "combo";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPrepFrontmatter {
  title: string;
  slug: string;
  category: MealPrepCategory;
  tags: string[];
  storageDurationDays: { fridge: number; freezer: number };
  reheatingTips: string;
  whyGoodForPrep: string;
  relatedRecipeIds?: number[];
  image?: string;
  // Combo-meal fields: an assembled, ready-to-eat meal built from a few
  // components (e.g. avocado-egg mix + pita + sauce), as opposed to a single
  // batch-cooked ingredient like rice or chicken.
  mealType?: MealType;
  ingredients?: string[];
  assemblySteps?: string[];
  nutritionPerServing?: { calories: number; proteinG: number };
}

export interface MealPrepEntry extends MealPrepFrontmatter {
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "meal-prep");

export function getAllMealPrepEntries(): MealPrepEntry[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      return { ...(data as MealPrepFrontmatter), content };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getMealPrepEntry(slug: string): MealPrepEntry | undefined {
  return getAllMealPrepEntries().find((entry) => entry.slug === slug);
}
