import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// The single seam where an LLM provider is chosen. Nothing else in the
// codebase should import @ai-sdk/* directly — this is what makes switching
// the deployed demo from a free provider (Groq) to Claude a pure env-var
// change, with no code diff and no risk of the founder being billed for
// strangers' usage of a publicly shared link.
export function getLanguageModel(): LanguageModel {
  const provider = process.env.LLM_PROVIDER ?? "groq";
  const modelId = process.env.LLM_MODEL;

  switch (provider) {
    case "groq": {
      const groq = createGroq({ apiKey: requireKey("GROQ_API_KEY") });
      return groq(modelId || "llama-3.3-70b-versatile");
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: requireKey("ANTHROPIC_API_KEY") });
      return anthropic(modelId || "claude-sonnet-5");
    }
    case "openai": {
      const openai = createOpenAI({ apiKey: requireKey("OPENAI_API_KEY") });
      return openai(modelId || "gpt-4o-mini");
    }
    default:
      throw new Error(
        `Unknown LLM_PROVIDER "${provider}". Use one of: groq, anthropic, openai.`
      );
  }
}

function requireKey(envVar: string): string {
  const key = process.env[envVar];
  if (!key) {
    throw new Error(
      `${envVar} is not set. Add it to .env.local (see .env.example) or switch LLM_PROVIDER.`
    );
  }
  return key;
}
