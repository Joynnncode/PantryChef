export type KBChunkType = "meal-prep" | "nutrition-knowledge";

export interface KBChunkMetadata {
  type: KBChunkType;
  title: string;
  url?: string;
}

export interface KBChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: KBChunkMetadata;
}
