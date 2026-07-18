"use client";

import { useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function IngredientInput({
  ingredients,
  onChange,
  onSubmit,
  loading = false,
}: {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  onSubmit: (ingredients: string[]) => void;
  loading?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addIngredient() {
    const value = draft.trim().toLowerCase();
    if (!value || ingredients.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...ingredients, value]);
    setDraft("");
  }

  function removeIngredient(target: string) {
    onChange(ingredients.filter((i) => i !== target));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient();
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. chicken breast, rice, broccoli"
          aria-label="Add an ingredient"
        />
        <Button variant="secondary" onClick={addIngredient} type="button">
          Add
        </Button>
      </div>

      {ingredients.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 py-1 pl-3 pr-2 text-sm text-primary-800 border border-primary-100"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
                aria-label={`Remove ${ingredient}`}
                className="rounded-full px-1 text-primary-500 hover:bg-primary-100 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <Button
        className="mt-4"
        disabled={ingredients.length === 0 || loading}
        onClick={() => onSubmit(ingredients)}
        type="button"
      >
        {loading ? "Searching…" : "Find recipes"}
      </Button>
    </div>
  );
}
