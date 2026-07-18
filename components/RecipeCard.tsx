import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import type { RecipeSummary } from "@/lib/apis/spoonacular";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {recipe.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        )}
        <CardBody>
          <h3 className="font-semibold text-foreground line-clamp-2">{recipe.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary-50 px-2 py-1 text-primary-700">
              {recipe.usedIngredientCount} ingredients you have
            </span>
            {recipe.missedIngredientCount > 0 && (
              <span className="rounded-full bg-surface-muted px-2 py-1 text-foreground-muted">
                +{recipe.missedIngredientCount} needed
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
