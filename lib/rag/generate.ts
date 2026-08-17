import { generateText } from "ai";
import { startActiveObservation } from "@langfuse/tracing";
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
  // Retrieval and generation are wrapped in one root span so the Langfuse
  // trace is named for what it does rather than for whichever model served
  // it — otherwise the trace list shows only `invoke_agent <model>`, which
  // renames itself every time the provider is swapped. The span is a no-op
  // when no tracer is registered, so this stays inert without Langfuse keys.
  return startActiveObservation("rag-answer", async (span) => {
    const chunks = await retrieveRelevantChunks(question, 5);

    const { text } = await generateText({
      model: getLanguageModel(),
      system: buildRagSystemPrompt(),
      prompt: buildRagUserPrompt(question, ingredients, chunks),
      experimental_telemetry: { functionId: "rag-answer" },
    });

    span.update({ input: question, output: text });

    return { answer: text, sources: dedupeSources(chunks) };
  });
}
