import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllMealPlanEntries, getMealPlanEntry } from "@/lib/content/mealPlans";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const GOAL_LABELS = { balanced: "Balanced", cutting: "Cutting" } as const;
const SLOT_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
} as const;

export function generateStaticParams() {
  return getAllMealPlanEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getMealPlanEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — Meal Prep Guide — PantryChef`,
    description: entry.summary,
  };
}

export default async function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getMealPlanEntry(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge>{GOAL_LABELS[entry.goal]}</Badge>
        {entry.tags.map((tag) => (
          <Badge key={tag} className="bg-surface-muted text-foreground-muted">
            {tag}
          </Badge>
        ))}
      </div>

      <h1 className="text-3xl font-semibold text-foreground">{entry.title}</h1>
      <p className="mt-3 text-foreground-muted">{entry.summary}</p>

      <Card className="my-8">
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase text-foreground-muted">
              Daily calories
            </div>
            <div className="mt-1 text-lg font-semibold text-primary-700">
              {entry.dailyCalorieTarget}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-foreground-muted">
              Protein focus
            </div>
            <div className="mt-1 text-lg font-semibold text-primary-700">
              {entry.proteinFocus}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-foreground-muted">
              Length
            </div>
            <div className="mt-1 text-lg font-semibold text-primary-700">
              {entry.days.length} days
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mb-8 space-y-4">
        {entry.days.map((day) => (
          <Card key={day.day}>
            <CardBody>
              <h3 className="mb-3 font-semibold text-foreground">{day.day}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {day.meals.map((meal) => (
                  <div key={meal.slot}>
                    <div className="text-xs font-medium uppercase text-foreground-muted">
                      {SLOT_LABELS[meal.slot]}
                    </div>
                    {meal.slug ? (
                      <Link
                        href={`/meal-prep/${meal.slug}`}
                        className="mt-1 block text-sm font-medium text-primary-700 hover:underline"
                      >
                        {meal.label}
                      </Link>
                    ) : (
                      <div className="mt-1 text-sm text-foreground">{meal.label}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Grocery highlights</h2>
        <ul className="grid grid-cols-1 gap-1.5 text-foreground-muted sm:grid-cols-2">
          {entry.groceryHighlights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <span aria-hidden>🛒</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <article className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground-muted prose-li:text-foreground-muted prose-strong:text-foreground">
        <MDXRemote source={entry.content} />
      </article>

      <div className="mt-10 border-t border-border pt-6">
        <p className="mb-3 text-sm text-foreground-muted">
          Have a question about following {entry.title.toLowerCase()}?
        </p>
        <Button
          href={`/ask?q=${encodeURIComponent(`How do I follow the ${entry.title}?`)}`}
          variant="secondary"
        >
          Ask PantryChef
        </Button>
      </div>
    </div>
  );
}
