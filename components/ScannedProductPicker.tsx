"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ScanHistoryEntry } from "@/lib/storage/localStore";

const PREVIEW_COUNT = 2;

export function ScannedProductPicker({
  entries,
  selectedIngredients,
  onToggle,
}: {
  entries: ScanHistoryEntry[];
  selectedIngredients: string[];
  onToggle: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) return null;

  const hasMore = entries.length > PREVIEW_COUNT;
  const visibleEntries = expanded ? entries : entries.slice(0, PREVIEW_COUNT);

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-foreground-muted">
          From your scans
        </h2>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            {expanded ? "Show less" : `Show all (${entries.length})`}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleEntries.map((entry) => {
          const normalized = entry.name.trim().toLowerCase();
          const active = selectedIngredients.includes(normalized);
          return (
            <button
              key={entry.barcode}
              type="button"
              onClick={() => onToggle(normalized)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-border bg-surface text-foreground-muted hover:bg-primary-50 hover:text-primary-700"
              )}
            >
              {entry.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.imageUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs">🥫</span>
              )}
              {entry.name}
              {active && <span aria-hidden>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
