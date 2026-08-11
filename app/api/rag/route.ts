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
    const message =
      error instanceof Error && error.message.includes("is not set")
        ? error.message
        : "PantryChef couldn't generate an answer right now. Please try again in a moment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
