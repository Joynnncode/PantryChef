import fs from "node:fs";
import path from "node:path";
import { embedText } from "@/lib/embeddings/embed";
import { topK } from "@/lib/embeddings/similarity";
import type { KBChunk } from "./types";

const KB_PATH = path.join(process.cwd(), "data", "kb", "embeddings.json");

// Cached per server instance — the KB is small (a few hundred chunks at
// most) and rebuilt only via `npm run ingest`, so re-reading it from disk
// on every request would be pure waste.
let kbCache: KBChunk[] | null = null;

function loadKB(): KBChunk[] {
  if (!kbCache) {
    if (!fs.existsSync(KB_PATH)) {
      throw new Error(
        "Knowledge base not found. Run `npm run ingest` to build data/kb/embeddings.json."
      );
    }
    kbCache = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  }
  return kbCache!;
}

export async function retrieveRelevantChunks(query: string, k = 5): Promise<KBChunk[]> {
  const kb = loadKB();
  const queryEmbedding = await embedText(query);
  const ranked = topK(kb, (chunk) => chunk.embedding, queryEmbedding, k);
  return ranked.map((r) => r.item);
}
