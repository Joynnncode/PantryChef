import { LangfuseSpanProcessor } from "@langfuse/otel";

// Only constructed when a key is present, so local dev/CI without a
// Langfuse account keeps working exactly as before (same "bring your own
// key" pattern as the LLM/embedding providers).
export const langfuseSpanProcessor = process.env.LANGFUSE_SECRET_KEY
  ? new LangfuseSpanProcessor()
  : null;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !langfuseSpanProcessor) return;

  // Imported here rather than at module scope per Next.js's instrumentation
  // guidance, since @opentelemetry/sdk-node is Node-only and this file also
  // loads under the edge runtime.
  const [{ NodeSDK }, { LangfuseVercelAiSdkIntegration }, { registerTelemetry }] =
    await Promise.all([
      import("@opentelemetry/sdk-node"),
      import("@langfuse/vercel-ai-sdk"),
      import("ai"),
    ]);

  new NodeSDK({ spanProcessors: [langfuseSpanProcessor] }).start();
  registerTelemetry(new LangfuseVercelAiSdkIntegration());
}
