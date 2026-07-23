import { cn } from "@/lib/utils/cn";
import type { ScanHistoryEntry } from "@/lib/storage/localStore";

export function ScannedProductPicker({
  entries,
  selectedIngredients,
  onToggle,
}: {
  entries: ScanHistoryEntry[];
  selectedIngredients: string[];
  onToggle: (name: string) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase text-foreground-muted">
        From your scans
      </h2>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => {
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
