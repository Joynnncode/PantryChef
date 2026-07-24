import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { MealPlanFrontmatter } from "@/lib/content/mealPlans";

const GOAL_LABELS: Record<MealPlanFrontmatter["goal"], string> = {
  balanced: "Balanced",
  cutting: "Cutting",
};

export function MealPlanCard({ entry }: { entry: MealPlanFrontmatter }) {
  return (
    <Link href={`/meal-prep/plans/${entry.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{entry.title}</h3>
            <Badge>{GOAL_LABELS[entry.goal]}</Badge>
          </div>
          <p className="flex-1 text-sm text-foreground-muted">{entry.summary}</p>
          <div className="flex flex-wrap gap-1.5 text-xs text-foreground-muted">
            <span className="rounded-full bg-surface-muted px-2 py-1">
              {entry.dailyCalorieTarget}
            </span>
            <span className="rounded-full bg-surface-muted px-2 py-1">
              {entry.proteinFocus} protein
            </span>
            <span className="rounded-full bg-surface-muted px-2 py-1">
              {entry.days.length} days
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
