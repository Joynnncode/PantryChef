const BASE_URL = "https://api.spoonacular.com/recipes";

// Long TTLs are intentional: Spoonacular's free tier is ~150 points/day,
// so we cache aggressively rather than risk exhausting the quota.
const FIND_BY_INGREDIENTS_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const RECIPE_DETAIL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days, details rarely change

export interface RecipeSummary {
  id: number;
  title: string;
  image: string | null;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: string[];
}

export interface NutritionPerServing {
  calories: number;
  sugarG: number;
  saturatedFatG: number;
  sodiumMg: number;
  fiberG: number;
  proteinG: number;
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string | null;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  ingredients: string[];
  instructions: string[];
  nutritionPerServing: NutritionPerServing | null;
}

function getApiKey(): string {
  const key = process.env.SPOONACULAR_API_KEY;
  if (!key) {
    throw new Error(
      "SPOONACULAR_API_KEY is not set. Get a free key at https://spoonacular.com/food-api and add it to .env.local"
    );
  }
  return key;
}

export async function findRecipesByIngredients(
  ingredients: string[],
  limit = 8
): Promise<RecipeSummary[]> {
  const params = new URLSearchParams({
    apiKey: getApiKey(),
    ingredients: ingredients.join(","),
    number: String(limit),
    ranking: "1", // maximize used ingredients
    ignorePantry: "true",
  });

  const res = await fetch(`${BASE_URL}/findByIngredients?${params.toString()}`, {
    next: { revalidate: FIND_BY_INGREDIENTS_TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Spoonacular findByIngredients failed: ${res.status}`);
  }

  const data: Array<{
    id: number;
    title: string;
    image?: string;
    usedIngredientCount: number;
    missedIngredientCount: number;
    missedIngredients: { name: string }[];
  }> = await res.json();

  return data.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image ?? null,
    usedIngredientCount: recipe.usedIngredientCount,
    missedIngredientCount: recipe.missedIngredientCount,
    missedIngredients: recipe.missedIngredients.map((i) => i.name),
  }));
}

function extractNutrient(
  nutrients: Array<{ name: string; amount: number }>,
  name: string
): number {
  return nutrients.find((n) => n.name === name)?.amount ?? 0;
}

export async function getRecipeDetail(id: number): Promise<RecipeDetail> {
  const params = new URLSearchParams({
    apiKey: getApiKey(),
    includeNutrition: "true",
  });

  const res = await fetch(`${BASE_URL}/${id}/information?${params.toString()}`, {
    next: { revalidate: RECIPE_DETAIL_TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Spoonacular getRecipeInformation failed: ${res.status}`);
  }

  const data: {
    id: number;
    title: string;
    image?: string;
    servings: number;
    readyInMinutes: number;
    sourceUrl: string;
    extendedIngredients: { original: string }[];
    analyzedInstructions: { steps: { step: string }[] }[];
    nutrition?: { nutrients: Array<{ name: string; amount: number }> };
  } = await res.json();

  const nutrients = data.nutrition?.nutrients ?? [];
  const nutritionPerServing: NutritionPerServing | null = data.nutrition
    ? {
        calories: extractNutrient(nutrients, "Calories"),
        sugarG: extractNutrient(nutrients, "Sugar"),
        saturatedFatG: extractNutrient(nutrients, "Saturated Fat"),
        sodiumMg: extractNutrient(nutrients, "Sodium"),
        fiberG: extractNutrient(nutrients, "Fiber"),
        proteinG: extractNutrient(nutrients, "Protein"),
      }
    : null;

  return {
    id: data.id,
    title: data.title,
    image: data.image ?? null,
    servings: data.servings,
    readyInMinutes: data.readyInMinutes,
    sourceUrl: data.sourceUrl,
    ingredients: data.extendedIngredients.map((i) => i.original),
    instructions: data.analyzedInstructions.flatMap((block) =>
      block.steps.map((s) => s.step)
    ),
    nutritionPerServing,
  };
}
