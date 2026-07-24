import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { MealPrepFrontmatter } from "@/lib/content/mealPrep";

export function MealPrepCard({ entry }: { entry: MealPrepFrontmatter }) {
  return (
    <Link href={`/meal-prep/${entry.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{entry.title}</h3>
            <Badge className="capitalize">{entry.category.replace("-", " ")}</Badge>
          </div>
          <p className="flex-1 text-sm text-foreground-muted">{entry.whyGoodForPrep}</p>
          <div className="flex flex-wrap gap-1.5 text-xs text-foreground-muted">
            <span className="rounded-full bg-surface-muted px-2 py-1">
              Fridge {entry.storageDurationDays.fridge}d
            </span>
            {entry.storageDurationDays.freezer > 0 && (
              <span className="rounded-full bg-surface-muted px-2 py-1">
                Freezer {entry.storageDurationDays.freezer}d
              </span>
            )}
            {entry.mealType && (
              <span className="rounded-full bg-surface-muted px-2 py-1 capitalize">
                {entry.mealType}
              </span>
            )}
            {entry.nutritionPerServing && (
              <span className="rounded-full bg-surface-muted px-2 py-1">
                {entry.nutritionPerServing.calories} kcal ·{" "}
                {entry.nutritionPerServing.proteinG}g protein
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
