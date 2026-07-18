import { describe, expect, it } from "vitest";
import { cosineSimilarity, topK } from "./similarity";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("handles a zero vector without dividing by zero", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe("topK", () => {
  const items = [
    { id: "a", embedding: [1, 0] },
    { id: "b", embedding: [0, 1] },
    { id: "c", embedding: [0.9, 0.1] },
  ];

  it("ranks items by similarity to the query, most similar first", () => {
    const results = topK(items, (i) => i.embedding, [1, 0], 2);
    expect(results.map((r) => r.item.id)).toEqual(["a", "c"]);
  });

  it("respects the k limit", () => {
    const results = topK(items, (i) => i.embedding, [1, 0], 1);
    expect(results).toHaveLength(1);
  });
});
