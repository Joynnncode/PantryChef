"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getFavoriteRecipeIds, toggleFavoriteRecipeId } from "@/lib/storage/localStore";

export function FavoriteButton({ recipeId }: { recipeId: number }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // localStorage is only readable client-side; syncing here (rather than
    // in a lazy useState initializer) avoids an SSR/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorite(getFavoriteRecipeIds().includes(recipeId));
  }, [recipeId]);

  return (
    <Button
      variant="secondary"
      onClick={() => setIsFavorite(toggleFavoriteRecipeId(recipeId).includes(recipeId))}
    >
      {isFavorite ? "★ Saved" : "☆ Save recipe"}
    </Button>
  );
}
