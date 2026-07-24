"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { UserMealPrepForm } from "@/components/UserMealPrepForm";
import { UserMealPrepCard } from "@/components/UserMealPrepCard";
import {
  addUserMealPrep,
  deleteUserMealPrep,
  getAllUserMealPreps,
  type UserMealPrep,
} from "@/lib/storage/userMealPreps";

export function UserMealPrepClient() {
  const [entries, setEntries] = useState<UserMealPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getAllUserMealPreps()
      .then(setEntries)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(entry: Omit<UserMealPrep, "id" | "createdAt">) {
    const saved = await addUserMealPrep(entry);
    setEntries((current) => [saved, ...current]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this meal prep?")) return;
    await deleteUserMealPrep(id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          Saved only on this device — nothing here is uploaded or shared with anyone.
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            + Add meal prep
          </Button>
        )}
      </div>

      {showForm && (
        <UserMealPrepForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {loadError && (
        <p className="text-sm text-grade-e">
          Couldn&apos;t load your saved meal preps. Your browser may be blocking local
          storage (common in private/incognito mode).
        </p>
      )}

      {!loading && !loadError && entries.length === 0 && !showForm && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-foreground-muted">
          No meal preps saved yet. Add your first one — a photo, a name, and whatever
          notes help you remember how you made it.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <UserMealPrepCard key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
