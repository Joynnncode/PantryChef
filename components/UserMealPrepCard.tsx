"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import type { UserMealPrep } from "@/lib/storage/userMealPreps";

export function UserMealPrepCard({
  entry,
  onDelete,
}: {
  entry: UserMealPrep;
  onDelete: (id: string) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!entry.photo) return;
    const url = URL.createObjectURL(entry.photo);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.photo]);

  return (
    <Card className="overflow-hidden">
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={entry.title} className="h-40 w-full object-cover" />
      )}
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{entry.title}</h3>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            aria-label={`Delete ${entry.title}`}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-foreground-muted hover:bg-grade-e/10 hover:text-grade-e"
          >
            Delete
          </button>
        </div>

        {entry.notes && (
          <p className="whitespace-pre-wrap text-sm text-foreground-muted">
            {entry.notes}
          </p>
        )}

        {(entry.fridgeDays != null || entry.freezerDays != null) && (
          <div className="flex flex-wrap gap-1.5 text-xs text-foreground-muted">
            {entry.fridgeDays != null && (
              <span className="rounded-full bg-surface-muted px-2 py-1">
                Fridge {entry.fridgeDays}d
              </span>
            )}
            {entry.freezerDays != null && (
              <span className="rounded-full bg-surface-muted px-2 py-1">
                Freezer {entry.freezerDays}d
              </span>
            )}
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 border border-primary-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
