const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";

// Products change infrequently; caching keeps latency down and is good-citizen
// behavior toward a free, donation-funded API — even though it has no quota.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type NutriScoreGrade = "a" | "b" | "c" | "d" | "e";

export interface NutrimentsPer100g {
  caloriesKcal: number | null;
  sugarG: number | null;
  saturatedFatG: number | null;
  sodiumMg: number | null;
  fiberG: number | null;
  proteinG: number | null;
}

export interface FoodProduct {
  barcode: string;
  name: string;
  brand: string | null;
  quantity: string | null;
  imageUrl: string | null;
  nutriScoreGrade: NutriScoreGrade | null;
  novaGroup: number | null;
  ingredientsText: string | null;
  additives: string[];
  allergens: string[];
  nutrimentsPer100g: NutrimentsPer100g | null;
}

function userAgent(): string {
  return (
    process.env.OPEN_FOOD_FACTS_USER_AGENT ??
    "PantryChef/1.0 (github.com/your-username/pantrychef)"
  );
}

function isNutriScoreGrade(value: unknown): value is NutriScoreGrade {
  return typeof value === "string" && ["a", "b", "c", "d", "e"].includes(value);
}

interface RawProduct {
  code: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  image_url?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  additives_tags?: string[];
  allergens_tags?: string[];
  nutriments?: Record<string, number>;
}

function normalizeNutriments(nutriments?: Record<string, number>): NutrimentsPer100g | null {
  if (!nutriments) return null;

  // Open Food Facts reports sodium in grams per 100g; the health-score
  // formula elsewhere in the app works in mg, so convert here for consistency.
  const sodiumG = nutriments["sodium_100g"];

  return {
    caloriesKcal: nutriments["energy-kcal_100g"] ?? null,
    sugarG: nutriments["sugars_100g"] ?? null,
    saturatedFatG: nutriments["saturated-fat_100g"] ?? null,
    sodiumMg: typeof sodiumG === "number" ? sodiumG * 1000 : null,
    fiberG: nutriments["fiber_100g"] ?? null,
    proteinG: nutriments["proteins_100g"] ?? null,
  };
}

function normalizeProduct(raw: RawProduct): FoodProduct {
  const grade = raw.nutriscore_grade?.toLowerCase();
  return {
    barcode: raw.code,
    name: raw.product_name || "Unknown product",
    brand: raw.brands || null,
    quantity: raw.quantity || null,
    imageUrl: raw.image_url ?? null,
    nutriScoreGrade: isNutriScoreGrade(grade) ? grade : null,
    novaGroup: raw.nova_group ?? null,
    ingredientsText: raw.ingredients_text || null,
    additives: (raw.additives_tags ?? []).map((tag) => tag.replace(/^en:/, "")),
    allergens: (raw.allergens_tags ?? []).map((tag) => tag.replace(/^en:/, "")),
    nutrimentsPer100g: normalizeNutriments(raw.nutriments),
  };
}

export async function getProductByBarcode(barcode: string): Promise<FoodProduct | null> {
  const res = await fetch(`${PRODUCT_URL}/${encodeURIComponent(barcode)}.json`, {
    headers: { "User-Agent": userAgent() },
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Open Food Facts product lookup failed: ${res.status}`);
  }

  const data: { status: number; product?: RawProduct } = await res.json();
  if (data.status !== 1 || !data.product) return null;

  return normalizeProduct(data.product);
}

export async function searchProducts(query: string, limit = 10): Promise<FoodProduct[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(limit),
  });

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: { "User-Agent": userAgent() },
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Open Food Facts search failed: ${res.status}`);
  }

  const data: { products: RawProduct[] } = await res.json();
  return data.products.filter((p) => p.product_name).map(normalizeProduct);
}
