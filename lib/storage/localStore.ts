const KEYS = {
  ingredients: "pantrychef:ingredients",
  favorites: "pantrychef:favorites",
  scanHistory: "pantrychef:scan-history",
} as const;

const SCAN_HISTORY_LIMIT = 50;

export interface ScanHistoryEntry {
  barcode: string;
  name: string;
  imageUrl: string | null;
  nutriScoreGrade: string | null;
  scannedAt: number;
}

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

export function getScanHistory(): ScanHistoryEntry[] {
  return readJSON<ScanHistoryEntry[]>(KEYS.scanHistory, []);
}

export function addScanHistoryEntry(
  entry: Omit<ScanHistoryEntry, "scannedAt">
): ScanHistoryEntry[] {
  const current = getScanHistory().filter((e) => e.barcode !== entry.barcode);
  const next = [{ ...entry, scannedAt: Date.now() }, ...current].slice(
    0,
    SCAN_HISTORY_LIMIT
  );
  writeJSON(KEYS.scanHistory, next);
  return next;
}

export function clearScanHistory(): void {
  writeJSON(KEYS.scanHistory, []);
}
