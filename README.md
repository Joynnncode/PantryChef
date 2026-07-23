# PantryChef

Cook with what you already have. Tell PantryChef your ingredients and it finds recipes and cooking tutorial videos, scores how healthy each meal is, helps you check packaged ingredients, and answers cooking questions in plain language — grounded in a retrieval-augmented (RAG) knowledge base.

Live demo: **[mealguidance.vercel.app](https://mealguidance.vercel.app)**

## Features

- **Discover** — find recipes and YouTube tutorials ranked by how many of your ingredients they use ([`/discover`](app/discover/page.tsx)). Scanned products link straight in via "Find recipes with this," pre-filling the ingredient list.
- **Ask PantryChef** — a RAG-powered chat that answers cooking and nutrition questions, grounded in a local knowledge base of meal-prep guides and nutrition facts, with cited sources ([`/ask`](app/ask/page.tsx)).
- **Scan** — point your phone's camera at a barcode (or type it in) to see a product's Nutri-Score, NOVA processing group, and additives, via the open [Open Food Facts](https://world.openfoodfacts.org/) database ([`/scan`](app/scan/page.tsx)). Camera scanning runs entirely in the browser via [ZXing](https://github.com/zxing-js/library) — no app install required. Works well for European users specifically: Nutri-Score and NOVA are EU nutrition standards, and the scanner reads EAN-13 (the standard European barcode format) out of the box. Ingredient text is shown in whatever language the product was originally logged in on Open Food Facts (not auto-translated).
- **Health scoring** — every recipe gets an explainable A–E grade from a Nutri-Score-inspired formula over its nutrition facts ([`lib/health-score/nutriScore.ts`](lib/health-score/nutriScore.ts)).
- **Meal Prep guide** — a curated, MDX-driven collection of ingredients and meals that hold up well for batch cooking ([`/meal-prep`](app/meal-prep/page.tsx)).

No accounts — ingredients, favorites, and scan history are stored in your browser (`localStorage`) only.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, deployed to Vercel:

- **Recipes:** [Spoonacular](https://spoonacular.com/food-api) (`lib/apis/spoonacular.ts`)
- **Videos:** [YouTube Data API v3](https://developers.google.com/youtube/v3) (`lib/apis/youtube.ts`)
- **Product scanning:** [Open Food Facts](https://world.openfoodfacts.org/) (`lib/apis/openFoodFacts.ts`), no API key required
- **RAG:** embeddings via [Google's Generative AI API](https://ai.google.dev/gemini-api/docs/embeddings) (`gemini-embedding-001`, free tier — see below) + brute-force cosine similarity over a small JSON index — no vector database needed at this scale. (Local ONNX embeddings were tried first but dropped: `onnxruntime-node`'s native binary isn't available in Vercel's serverless runtime.)
- **LLM:** [Vercel AI SDK](https://sdk.vercel.ai/) with a pluggable provider (`lib/llm/client.ts`) — see below
- **Tests:** [Vitest](https://vitest.dev/), covering the pure health-score and similarity-search logic

## Why the LLM provider is swappable

`LLM_PROVIDER` picks the provider at runtime with zero code changes — this matters because a publicly shared demo link could otherwise run up the deployer's API bill from strangers' usage:

- **`groq`** (default) — free tier, safe for a public demo.
- **`anthropic`** — for a higher-quality personal demo (e.g. Claude).
- **`openai`** — also supported.

If you clone this repo, bring your own key for whichever provider you choose (see `.env.example`) — your usage, your bill, isolated from anyone else running their own copy.

## Getting started

```bash
git clone <this-repo-url>
cd mealguidance
npm install
cp .env.example .env.local
# fill in at least YOUTUBE_API_KEY, SPOONACULAR_API_KEY, GROQ_API_KEY, and
# GOOGLE_GENERATIVE_AI_API_KEY (all free) in .env.local
npm run ingest   # builds the RAG knowledge base — data/kb/embeddings.json is already committed, but re-run after editing content/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Getting free API keys

| Variable | Where to get it | Free tier |
|---|---|---|
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) → enable "YouTube Data API v3" → Credentials | ~100 searches/day |
| `SPOONACULAR_API_KEY` | [spoonacular.com/food-api](https://spoonacular.com/food-api) | ~150 points/day |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com/) | generous free tier |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | 10M tokens/min free |
| Open Food Facts | no key needed | — |

### A note on free-tier quotas

YouTube (~100 searches/day) and Spoonacular (~150 points/day) both have small free quotas. Results are cached aggressively (7–30 day TTLs) to stretch them as far as possible, and the app degrades gracefully — e.g. if the YouTube quota is exhausted, recipe results still show without videos rather than erroring out. If you fork this for real traffic, request a quota increase from Google early (it takes a few days to approve).

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build
npm run lint          # ESLint
npm run typecheck  # tsc --noEmit
npm run test          # Vitest
npm run ingest       # rebuild the RAG knowledge base from content/
```

## Deploying

1. Push this repo to your own GitHub account.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Deploy — `data/kb/embeddings.json` is committed, so no build-time ingest step is required.

## Project structure

```
app/                  # Next.js App Router pages + API routes (proxy every external API call)
components/            # UI primitives (components/ui/) + feature components
lib/
  apis/                 # typed, cached fetch wrappers for Spoonacular / YouTube / Open Food Facts
  health-score/    # pure Nutri-Score-inspired grading function (+ tests)
  embeddings/        # hosted embedding model client + cosine similarity (+ tests)
  rag/                    # retrieval + generation over the knowledge base
  llm/                    # pluggable LLM provider client + prompts
  content/              # Meal Prep MDX parsing
  storage/             # localStorage helpers (no backend user data)
content/meal-prep/*.mdx   # curated Meal Prep articles — add a file here to add an entry
content/nutrition-knowledge.json  # hand-authored nutrition facts fed into the RAG index
scripts/ingest.ts     # builds data/kb/embeddings.json from content/
data/kb/embeddings.json  # generated RAG index (committed so a fresh clone works immediately)
```

## License

MIT — see [LICENSE](LICENSE).
