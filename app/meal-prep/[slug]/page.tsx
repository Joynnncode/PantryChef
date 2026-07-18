import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllMealPrepEntries, getMealPrepEntry } from "@/lib/content/mealPrep";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return getAllMealPrepEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getMealPrepEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — Meal Prep Guide — PantryChef`,
    description: entry.whyGoodForPrep,
  };
}

export default async function MealPrepDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getMealPrepEntry(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <Badge className="capitalize">{entry.category.replace("-", " ")}</Badge>
        {entry.tags.map((tag) => (
          <Badge key={tag} className="bg-surface-muted text-foreground-muted">
            {tag}
          </Badge>
        ))}
      </div>

      <h1 className="text-3xl font-semibold text-foreground">{entry.title}</h1>
      <p className="mt-3 text-foreground-muted">{entry.whyGoodForPrep}</p>

      <Card className="my-8">
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase text-foreground-muted">
              Fridge life
            </div>
            <div className="mt-1 text-lg font-semibold text-primary-700">
              {entry.storageDurationDays.fridge} days
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-foreground-muted">
              Freezer life
            </div>
            <div className="mt-1 text-lg font-semibold text-primary-700">
              {entry.storageDurationDays.freezer > 0
                ? `${entry.storageDurationDays.freezer} days`
                : "Not recommended"}
            </div>
          </div>
          <div className="sm:col-span-1">
            <div className="text-xs font-medium uppercase text-foreground-muted">
              Reheating
            </div>
            <div className="mt-1 text-sm text-foreground">{entry.reheatingTips}</div>
          </div>
        </CardBody>
      </Card>

      <article className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground-muted prose-li:text-foreground-muted prose-strong:text-foreground">
        <MDXRemote source={entry.content} />
      </article>

      <div className="mt-10 border-t border-border pt-6">
        <p className="mb-3 text-sm text-foreground-muted">
          Have a more specific question about {entry.title.toLowerCase()}?
        </p>
        <Button
          href={`/ask?q=${encodeURIComponent(`How do I meal prep ${entry.title.toLowerCase()}?`)}`}
          variant="secondary"
        >
          Ask PantryChef
        </Button>
      </div>
    </div>
  );
}
