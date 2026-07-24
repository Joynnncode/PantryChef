import { UserMealPrepClient } from "@/components/UserMealPrepClient";

export const metadata = {
  title: "My Meal Preps — PantryChef",
  description: "Your own meal prep recipes and photos, saved privately on this device.",
};

export default function MyMealPrepsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">My Meal Preps</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Record your own meal prep — a photo, what&apos;s in it, and how long it
          keeps. This is separate from the curated Meal Prep Guide and lives only in
          your browser.
        </p>
      </div>
      <UserMealPrepClient />
    </div>
  );
}
