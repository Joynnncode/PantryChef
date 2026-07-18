# Contributing to PantryChef

## Adding a Meal Prep article

Drop a new `.mdx` file into [`content/meal-prep/`](content/meal-prep/) with this frontmatter:

```yaml
---
title: "Your Ingredient or Meal"
slug: "your-ingredient-or-meal"
category: "protein"          # protein | grain | vegetable | full-meal | sauce-condiment
tags: ["tag-one", "tag-two"]
storageDurationDays:
  fridge: 4
  freezer: 90                 # use 0 if it doesn't freeze well
reheatingTips: "One or two sentences on how to reheat it well."
whyGoodForPrep: "One or two sentences on why it's a good meal-prep choice."
relatedRecipeIds: []          # optional Spoonacular recipe IDs
---

Free-form Markdown body — tips, variations, common mistakes.
```

Then rebuild the RAG index so the article is searchable from `/ask`:

```bash
npm run ingest
```

Commit both the new `.mdx` file and the updated `data/kb/embeddings.json`.

## Adding a nutrition-knowledge snippet

Add an entry to [`content/nutrition-knowledge.json`](content/nutrition-knowledge.json) with `id`, `title`, and `text`, then run `npm run ingest` the same way.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

All four should pass without needing any API keys.

## Code style

- TypeScript, no `any` where a real type is easy to express.
- No comments explaining *what* code does — only *why*, when it's non-obvious.
- Prefer editing an existing file/pattern over introducing a new one; see `lib/apis/*.ts` for the shape typed API wrappers should follow.
