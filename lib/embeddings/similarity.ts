export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface ScoredItem<T> {
  item: T;
  score: number;
}

export function topK<T>(
  items: T[],
  getEmbedding: (item: T) => number[],
  queryEmbedding: number[],
  k: number
): ScoredItem<T>[] {
  return items
    .map((item) => ({ item, score: cosineSimilarity(getEmbedding(item), queryEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
