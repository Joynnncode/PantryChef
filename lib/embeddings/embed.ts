import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

// Embeddings run via Google's free-tier Generative AI embedding API rather
// than a local ONNX model: transformers.js's onnxruntime-node dependency
// needs a native libonnxruntime.so.1 binary that isn't available in
// Vercel's serverless Node.js runtime, which made local embeddings crash
// in production. This keeps the "zero marginal cost" property (Google's
// free tier is generous — 10M tokens/min) without the native-binary problem.
const EMBEDDING_MODEL = google.embedding("gemini-embedding-001");

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: EMBEDDING_MODEL, value: text });
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: EMBEDDING_MODEL, values: texts });
  return embeddings;
}
