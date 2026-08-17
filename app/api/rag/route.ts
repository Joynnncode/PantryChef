import { NextRequest, NextResponse, after } from "next/server";
import { answerQuestion } from "@/lib/rag/generate";
import { langfuseSpanProcessor } from "@/instrumentation";

export async function POST(request: NextRequest) {
  // Serverless functions can suspend right after the response is sent, so
  // force a flush instead of waiting for the processor's normal batch timer.
  const spanProcessor = langfuseSpanProcessor;
  if (spanProcessor) {
    after(async () => {
      await spanProcessor.forceFlush();
    });
  }

  const body: { question?: string; ingredients?: string[] } = await request.json();
  const question = body.question?.trim();

  if (!question) {
    return NextResponse.json({ error: "Provide a 'question'." }, { status: 400 });
  }

  try {
    const result = await answerQuestion(question, body.ingredients);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/rag]", error);
    const raw = error instanceof Error ? error.message : String(error);

    // A missing key is self-explanatory, so it stays the headline. Everything
    // else keeps the friendly line but carries the upstream message in
    // `detail`: when Groq decommissioned llama-3.3-70b-versatile, the 404 was
    // swallowed here and the only symptom was a generic "try again", which
    // cost an afternoon of guessing which of the three APIs had broken.
    if (raw.includes("is not set")) {
      return NextResponse.json({ error: raw }, { status: 502 });
    }

    return NextResponse.json(
      {
        error: "PantryChef couldn't generate an answer right now. Please try again in a moment.",
        detail: redactSecrets(raw),
      },
      { status: 502 }
    );
  }
}

// `detail` reaches the browser, and provider errors sometimes echo the
// credential they rejected. Scrub anything shaped like one of our keys before
// it leaves the server.
const SECRET_PATTERN = /\b(?:gsk_|sk-(?:lf-)?|pk-lf-|AIza)[A-Za-z0-9_-]{8,}/g;

function redactSecrets(message: string): string {
  return message.replace(SECRET_PATTERN, "[redacted]");
}
