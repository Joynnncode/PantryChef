import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/rag/generate";

export async function POST(request: NextRequest) {
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
