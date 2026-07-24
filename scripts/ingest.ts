import fs from "node:fs";
import path from "node:path";
import { getAllMealPrepEntries } from "../lib/content/mealPrep";
import { getAllMealPlanEntries } from "../lib/content/mealPlans";
import { embedText } from "../lib/embeddings/embed";
import type { KBChunk } from "../lib/rag/types";

const OUTPUT_PATH = path.join(process.cwd(), "data", "kb", "embeddings.json");
const NUTRITION_KNOWLEDGE_PATH = path.join(
  process.cwd(),
  "content",
  "nutrition-knowledge.json"
);

interface NutritionSnippet {
  id: string;
  title: string;
  text: string;
}

async function buildChunks(): Promise<Array<{ id: string; text: string; metadata: KBChunk["metadata"] }>> {
  const chunks: Array<{ id: string; text: string; metadata: KBChunk["metadata"] }> = [];

  for (const entry of getAllMealPrepEntries()) {
    chunks.push({
      id: `meal-prep:${entry.slug}`,
      text: [entry.title, entry.whyGoodForPrep, entry.content].join("\n\n"),
      metadata: {
        type: "meal-prep",
        title: entry.title,
        url: `/meal-prep/${entry.slug}`,
      },
    });
  }

  for (const plan of getAllMealPlanEntries()) {
    const dayLines = plan.days
      .map(
        (day) =>
          `${day.day}: ${day.meals.map((meal) => `${meal.slot} - ${meal.label}`).join("; ")}`
      )
      .join("\n");
    chunks.push({
      id: `meal-plan:${plan.slug}`,
      text: [
        plan.title,
        plan.summary,
        `Daily calorie target: ${plan.dailyCalorieTarget}. Protein focus: ${plan.proteinFocus}.`,
        dayLines,
        plan.content,
      ].join("\n\n"),
      metadata: {
        type: "meal-prep",
        title: plan.title,
        url: `/meal-prep/plans/${plan.slug}`,
      },
    });
  }

  const nutritionSnippets: NutritionSnippet[] = JSON.parse(
    fs.readFileSync(NUTRITION_KNOWLEDGE_PATH, "utf-8")
  );

  for (const snippet of nutritionSnippets) {
    chunks.push({
      id: `nutrition:${snippet.id}`,
      text: `${snippet.title}\n\n${snippet.text}`,
      metadata: {
        type: "nutrition-knowledge",
        title: snippet.title,
      },
    });
  }

  return chunks;
}

async function main() {
  console.log("Building knowledge base chunks...");
  const chunks = await buildChunks();
  console.log(`Found ${chunks.length} chunks. Requesting embeddings (this may take a moment)...`);

  const kb: KBChunk[] = [];
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.text);
    kb.push({ ...chunk, embedding });
    console.log(`  embedded: ${chunk.id}`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(kb));
  console.log(`Wrote ${kb.length} chunks to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error("Ingest failed:", error);
  process.exit(1);
});
