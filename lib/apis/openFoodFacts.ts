const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";

// Products change infrequently; caching keeps latency down and is good-citizen
// behavior toward a free, donation-funded API — even though it has no quota.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type NutriScoreGrade = "a" | "b" | "c" | "d" | "e";

export interface FoodProduct {
  barcode: string;
  name: string;
  imageUrl: string | null;
  nutriScoreGrade: NutriScoreGrade | null;
  novaGroup: number | null;
  ingredientsText: string | null;
  additives: string[];
  allergens: string[];
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
  image_url?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  additives_tags?: string[];
  allergens_tags?: string[];
}

function normalizeProduct(raw: RawProduct): FoodProduct {
  const grade = raw.nutriscore_grade?.toLowerCase();
  return {
    barcode: raw.code,
    name: raw.product_name || "Unknown product",
    imageUrl: raw.image_url ?? null,
    nutriScoreGrade: isNutriScoreGrade(grade) ? grade : null,
    novaGroup: raw.nova_group ?? null,
    ingredientsText: raw.ingredients_text || null,
    additives: (raw.additives_tags ?? []).map((tag) => tag.replace(/^en:/, "")),
    allergens: (raw.allergens_tags ?? []).map((tag) => tag.replace(/^en:/, "")),
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
