"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { MealPrepCard } from "@/components/MealPrepCard";
import type { MealPrepFrontmatter, MealPrepCategory } from "@/lib/content/mealPrep";

const CATEGORY_LABELS: Record<MealPrepCategory, string> = {
  protein: "Protein",
  grain: "Grain",
  vegetable: "Vegetable",
  "full-meal": "Full meal",
  "sauce-condiment": "Sauce",
  combo: "Combo meal",
};

export function MealPrepBrowser({ entries }: { entries: MealPrepFrontmatter[] }) {
  const [activeCategory, setActiveCategory] = useState<MealPrepCategory | "all">("all");

  const categoriesPresent = Array.from(
    new Set(entries.map((entry) => entry.category))
  ) as MealPrepCategory[];

  const visibleEntries =
    activeCategory === "all"
      ? entries
      : entries.filter((entry) => entry.category === activeCategory);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "border-primary-500 bg-primary-500 text-white"
              : "border-border bg-surface text-foreground-muted hover:bg-primary-50 hover:text-primary-700"
          )}
        >
          All ({entries.length})
        </button>
        {categoriesPresent.map((category) => {
          const count = entries.filter((entry) => entry.category === category).length;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                activeCategory === category
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-border bg-surface text-foreground-muted hover:bg-primary-50 hover:text-primary-700"
              )}
            >
              {CATEGORY_LABELS[category]} ({count})
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEntries.map((entry) => (
          <MealPrepCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </div>
  );
}
