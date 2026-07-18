import { getAllMealPrepEntries } from "@/lib/content/mealPrep";
import { MealPrepCard } from "@/components/MealPrepCard";

export const metadata = {
  title: "Meal Prep Guide — PantryChef",
  description:
    "Curated guidance on which ingredients and meals hold up best for batch cooking and meal prep.",
};

export default function MealPrepPage() {
  const entries = getAllMealPrepEntries();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Meal Prep Guide</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          A curated collection of ingredients and meals that hold up well for batch
          cooking — how long they keep, how to store them, and how to reheat them
          without losing quality.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <MealPrepCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </div>
  );
}
