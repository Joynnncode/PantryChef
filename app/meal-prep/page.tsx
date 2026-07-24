import { getAllMealPrepEntries } from "@/lib/content/mealPrep";
import { getAllMealPlanEntries } from "@/lib/content/mealPlans";
import { MealPrepBrowser } from "@/components/MealPrepBrowser";
import { MealPlanCard } from "@/components/MealPlanCard";

export const metadata = {
  title: "Meal Prep Guide — PantryChef",
  description:
    "Curated guidance on which ingredients and meals hold up best for batch cooking and meal prep, plus full weekly meal prep plans.",
};

export default function MealPrepPage() {
  const entries = getAllMealPrepEntries();
  const plans = getAllMealPlanEntries();

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

      <div className="mb-12">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Weekly plans</h2>
        <p className="mb-4 text-sm text-foreground-muted">
          Full five-day rotations built from the combo meals and components below —
          pick a goal and follow the day-by-day breakdown.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <MealPlanCard key={plan.slug} entry={plan} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          Ingredients &amp; combo meals
        </h2>
        <p className="mb-4 text-sm text-foreground-muted">
          Individual components (rice, chicken, vegetables) and ready-to-eat combo
          meals assembled from them — filter by type below.
        </p>
        <MealPrepBrowser entries={entries} />
      </div>
    </div>
  );
}
