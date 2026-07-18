import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type MealPrepCategory =
  | "protein"
  | "grain"
  | "vegetable"
  | "full-meal"
  | "sauce-condiment";

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
