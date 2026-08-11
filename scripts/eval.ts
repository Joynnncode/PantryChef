import fs from "node:fs";
import path from "node:path";
import { retrieveRelevantChunks } from "../lib/rag/retrieve";
import { answerQuestion } from "../lib/rag/generate";

interface EvalItem {
  id: string;
  question: string;
  expectedSourceIds: string[];
  // Each inner array is a group of acceptable phrasings for one required
  // fact — the answer must contain at least one, and this must hold for
  // every group (AND of ORs), so paraphrasing doesn't cause a false fail.
  expectedFacts: string[][];
}

interface EvalResult {
  id: string;
  question: string;
  retrievalPass: boolean;
  correctnessPass: boolean;
  missingFacts: string[];
  answer: string;
  error?: string;
}

const EVAL_SET_PATH = path.join(process.cwd(), "evals", "rag-eval-set.json");
const RETRIEVAL_K = 5;
const RETRIEVAL_THRESHOLD = Number(process.env.EVAL_RETRIEVAL_THRESHOLD ?? 0.9);
const CORRECTNESS_THRESHOLD = Number(process.env.EVAL_CORRECTNESS_THRESHOLD ?? 0.8);

function checkFacts(answer: string, expectedFacts: string[][]): string[] {
  const lowerAnswer = answer.toLowerCase();
  const missing: string[] = [];
  for (const group of expectedFacts) {
    const found = group.some((phrase) => lowerAnswer.includes(phrase.toLowerCase()));
    if (!found) missing.push(group.join(" / "));
  }
  return missing;
}

async function runOne(item: EvalItem): Promise<EvalResult> {
  try {
    const chunks = await retrieveRelevantChunks(item.question, RETRIEVAL_K);
    const retrievedIds = chunks.map((c) => c.id);
    const retrievalPass = item.expectedSourceIds.some((id) => retrievedIds.includes(id));

    const { answer } = await answerQuestion(item.question);
    const missingFacts = checkFacts(answer, item.expectedFacts);

    return {
      id: item.id,
      question: item.question,
      retrievalPass,
      correctnessPass: missingFacts.length === 0,
      missingFacts,
      answer,
    };
  } catch (error) {
    return {
      id: item.id,
      question: item.question,
      retrievalPass: false,
      correctnessPass: false,
      missingFacts: [],
      answer: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const items: EvalItem[] = JSON.parse(fs.readFileSync(EVAL_SET_PATH, "utf-8"));
  console.log(`Running ${items.length} RAG eval cases (retrieval + answer correctness)...\n`);

  const results: EvalResult[] = [];
  // Sequential on purpose — the free-tier Groq/Google quotas this project
  // relies on are per-minute rate limited, and this only needs to finish
  // well within a CI job's timeout, not be fast.
  for (const item of items) {
    const result = await runOne(item);
    results.push(result);
    const status = result.error
      ? `ERROR: ${result.error}`
      : `retrieval=${result.retrievalPass ? "pass" : "FAIL"} correctness=${result.correctnessPass ? "pass" : "FAIL"}`;
    console.log(`  [${item.id}] ${status}`);
    if (!result.correctnessPass && !result.error) {
      console.log(`      missing: ${result.missingFacts.join("; ")}`);
      console.log(`      answer: ${result.answer.slice(0, 200)}${result.answer.length > 200 ? "..." : ""}`);
    }
  }

  const retrievalPassCount = results.filter((r) => r.retrievalPass).length;
  const correctnessPassCount = results.filter((r) => r.correctnessPass).length;
  const retrievalRate = retrievalPassCount / results.length;
  const correctnessRate = correctnessPassCount / results.length;

  console.log("\n── Summary ──");
  console.log(
    `Retrieval relevance:  ${retrievalPassCount}/${results.length} (${(retrievalRate * 100).toFixed(1)}%) — threshold ${(RETRIEVAL_THRESHOLD * 100).toFixed(0)}%`
  );
  console.log(
    `Answer correctness:   ${correctnessPassCount}/${results.length} (${(correctnessRate * 100).toFixed(1)}%) — threshold ${(CORRECTNESS_THRESHOLD * 100).toFixed(0)}%`
  );

  const failedRetrieval = retrievalRate < RETRIEVAL_THRESHOLD;
  const failedCorrectness = correctnessRate < CORRECTNESS_THRESHOLD;

  if (failedRetrieval || failedCorrectness) {
    console.log("\nFAILED — below threshold.");
    process.exit(1);
  }

  console.log("\nPASSED.");
}

main().catch((error) => {
  console.error("Eval run crashed:", error);
  process.exit(1);
});
