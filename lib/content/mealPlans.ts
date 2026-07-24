import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { MealType } from "./mealPrep";

export type MealPlanGoal = "balanced" | "cutting";

export interface MealPlanSlot {
  slot: MealType;
  label: string;
  // Links to a /meal-prep/[slug] entry when one exists (e.g. "brown-rice",
  // "avocado-egg-pita"); omitted when the slot is just a plain suggestion.
  slug?: string;
}

export interface MealPlanDay {
  day: string;
  meals: MealPlanSlot[];
}

export interface MealPlanFrontmatter {
  title: string;
  slug: string;
  goal: MealPlanGoal;
  summary: string;
  dailyCalorieTarget: string;
  proteinFocus: string;
  tags: string[];
  days: MealPlanDay[];
  groceryHighlights: string[];
}

export interface MealPlanEntry extends MealPlanFrontmatter {
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "meal-plans");

export function getAllMealPlanEntries(): MealPlanEntry[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      return { ...(data as MealPlanFrontmatter), content };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getMealPlanEntry(slug: string): MealPlanEntry | undefined {
  return getAllMealPlanEntries().find((entry) => entry.slug === slug);
}
