import type { KBChunk } from "@/lib/rag/types";

export function buildRagSystemPrompt(): string {
  return `You are PantryChef, a friendly cooking and nutrition assistant.

You answer questions about what to cook and how healthy a meal or ingredient is, using ONLY the context passages provided below plus the user's stated ingredients. If the context doesn't contain enough information to fully answer, say so plainly rather than inventing specifics — you may still offer general, common-sense cooking guidance, but be clear about what is grounded in the provided context versus general knowledge.

Keep answers concise (3-6 sentences, or a short list), practical, and encouraging. When you draw on a specific context passage, mention its title naturally in the answer (e.g. "As covered in our Chicken Breast meal-prep guide...").`;
}

export function buildRagUserPrompt(
  question: string,
  ingredients: string[] | undefined,
  chunks: KBChunk[]
): string {
  const context = chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.metadata.title}\n${chunk.text}`)
    .join("\n\n---\n\n");

  const ingredientsLine = ingredients?.length
    ? `The user has these ingredients on hand: ${ingredients.join(", ")}.\n\n`
    : "";

  return `${ingredientsLine}Question: ${question}\n\nContext passages:\n\n${context}`;
}
