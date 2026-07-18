import { generateText } from "ai";
import { getLanguageModel } from "@/lib/llm/client";
import { buildRagSystemPrompt, buildRagUserPrompt } from "@/lib/llm/prompts";
import { retrieveRelevantChunks } from "./retrieve";
import type { KBChunk } from "./types";

export interface RagAnswer {
  answer: string;
  sources: Array<{ title: string; url?: string }>;
}

function dedupeSources(chunks: KBChunk[]): Array<{ title: string; url?: string }> {
  const seen = new Set<string>();
  const sources: Array<{ title: string; url?: string }> = [];
  for (const chunk of chunks) {
    if (seen.has(chunk.metadata.title)) continue;
    seen.add(chunk.metadata.title);
    sources.push({ title: chunk.metadata.title, url: chunk.metadata.url });
  }
  return sources;
}

export async function answerQuestion(
  question: string,
  ingredients?: string[]
): Promise<RagAnswer> {
  const chunks = await retrieveRelevantChunks(question, 5);

  const { text } = await generateText({
    model: getLanguageModel(),
    system: buildRagSystemPrompt(),
    prompt: buildRagUserPrompt(question, ingredients, chunks),
  });

  return { answer: text, sources: dedupeSources(chunks) };
}
