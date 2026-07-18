const KEYS = {
  ingredients: "pantrychef:ingredients",
  favorites: "pantrychef:favorites",
} as const;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedIngredients(): string[] {
  return readJSON<string[]>(KEYS.ingredients, []);
}

export function saveIngredients(ingredients: string[]): void {
  writeJSON(KEYS.ingredients, ingredients);
}

export function getFavoriteRecipeIds(): number[] {
  return readJSON<number[]>(KEYS.favorites, []);
}

export function toggleFavoriteRecipeId(id: number): number[] {
  const current = getFavoriteRecipeIds();
  const next = current.includes(id)
    ? current.filter((favId) => favId !== id)
    : [...current, id];
  writeJSON(KEYS.favorites, next);
  return next;
}
