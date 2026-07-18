import { notFound } from "next/navigation";
import { getRecipeDetail } from "@/lib/apis/spoonacular";
import { Card, CardBody } from "@/components/ui/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { HealthGradeBadge } from "@/components/HealthGradeBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const recipe = await getRecipeDetail(Number(id));
    return { title: `${recipe.title} — PantryChef` };
  } catch {
    return { title: "Recipe — PantryChef" };
  }
}

const NUTRITION_ROWS: Array<{ key: "calories" | "sugarG" | "saturatedFatG" | "sodiumMg" | "fiberG" | "proteinG"; label: string; unit: string }> = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sugarG", label: "Sugar", unit: "g" },
  { key: "saturatedFatG", label: "Saturated fat", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
];

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let recipe;
  try {
    recipe = await getRecipeDetail(Number(id));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {recipe.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.image}
          alt={recipe.title}
          className="mb-6 h-64 w-full rounded-2xl object-cover"
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{recipe.title}</h1>
        <FavoriteButton recipeId={recipe.id} />
      </div>

      <div className="mt-2 flex gap-4 text-sm text-foreground-muted">
        <span>⏱ {recipe.readyInMinutes} min</span>
        <span>🍽 {recipe.servings} servings</span>
      </div>

      {recipe.nutritionPerServing && (
        <Card className="my-8">
          <CardBody>
            <HealthGradeBadge nutrition={recipe.nutritionPerServing} />

            <h2 className="mt-6 mb-3 text-sm font-semibold uppercase text-foreground-muted">
              Nutrition per serving
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {NUTRITION_ROWS.map((row) => (
                <div key={row.key}>
                  <div className="text-xs text-foreground-muted">{row.label}</div>
                  <div className="font-medium text-foreground">
                    {Math.round(recipe.nutritionPerServing![row.key])} {row.unit}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Ingredients</h2>
          <ul className="space-y-2 text-sm text-foreground-muted">
            {recipe.ingredients.map((ingredient, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary-400">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Instructions</h2>
          <ol className="space-y-3 text-sm text-foreground-muted">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-medium text-primary-700">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.sourceUrl && (
        <p className="mt-8 text-sm text-foreground-muted">
          Source:{" "}
          <a href={recipe.sourceUrl} className="text-primary-600 hover:underline">
            {recipe.sourceUrl}
          </a>
        </p>
      )}
    </div>
  );
}
