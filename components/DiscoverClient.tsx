"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IngredientInput } from "@/components/IngredientInput";
import { RecipeCard } from "@/components/RecipeCard";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { Spinner } from "@/components/ui/Spinner";
import { getSavedIngredients, saveIngredients } from "@/lib/storage/localStore";
import type { RecipeSummary } from "@/lib/apis/spoonacular";
import type { VideoResult } from "@/lib/apis/youtube";

export function DiscoverClient() {
  const searchParams = useSearchParams();
  const ingredientToAdd = searchParams.get("add")?.trim().toLowerCase();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeSummary[] | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // localStorage is only readable client-side; syncing here (rather than
    // in a lazy useState initializer) avoids an SSR/client hydration mismatch.
    const saved = getSavedIngredients();
    const merged =
      ingredientToAdd && !saved.includes(ingredientToAdd)
        ? [...saved, ingredientToAdd]
        : saved;
    if (merged !== saved) saveIngredients(merged);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIngredients(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(ingredients: string[]) {
    saveIngredients(ingredients);
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const [recipesRes, videosRes] = await Promise.all([
        fetch(`/api/recipes?ingredients=${encodeURIComponent(ingredients.join(","))}`),
        fetch(`/api/youtube?q=${encodeURIComponent(ingredients.slice(0, 3).join(" "))}`),
      ]);

      if (!recipesRes.ok) {
        throw new Error("Recipe search failed");
      }

      const recipesData: { recipes: RecipeSummary[] } = await recipesRes.json();
      const videosData: { videos: VideoResult[] } = videosRes.ok
        ? await videosRes.json()
        : { videos: [] };

      setRecipes(recipesData.recipes);
      setVideos(videosData.videos);
    } catch {
      setError(
        "Something went wrong searching for recipes. Make sure SPOONACULAR_API_KEY is set, or try again in a moment."
      );
      setRecipes([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Discover recipes</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Tell PantryChef what you have on hand — it&apos;ll find recipes ranked by how
          many of your ingredients they use, plus tutorial videos.
        </p>
      </div>

      <IngredientInput
        ingredients={ingredients}
        onChange={setIngredients}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {loading && (
        <div className="mt-10 flex items-center gap-2 text-foreground-muted">
          <Spinner />
          Searching recipes and videos…
        </div>
      )}

      {error && <p className="mt-8 text-sm text-grade-e">{error}</p>}

      {!loading && searched && recipes && recipes.length === 0 && !error && (
        <p className="mt-8 text-foreground-muted">
          No recipes found for that combination — try adding a more common ingredient.
        </p>
      )}

      {!loading && recipes && recipes.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recipes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Tutorial videos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <YouTubeEmbed key={video.videoId} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
