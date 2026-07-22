import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { GradePill } from "@/components/ui/GradePill";
import type { ScanHistoryEntry } from "@/lib/storage/localStore";

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ScanHistoryList({
  entries,
  onClear,
}: {
  entries: ScanHistoryEntry[];
  onClear: () => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-foreground-muted">
          Recent scans
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-foreground-muted hover:text-grade-e"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <Link
            key={entry.barcode}
            href={`/scan/${entry.barcode}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-sm"
          >
            {entry.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.imageUrl}
                alt={entry.name}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-lg">
                🥫
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
              <p className="text-xs text-foreground-muted">
                {formatRelativeTime(entry.scannedAt)}
              </p>
            </div>

            {entry.nutriScoreGrade ? (
              <GradePill
                grade={entry.nutriScoreGrade.toUpperCase() as "A" | "B" | "C" | "D" | "E"}
                className="shrink-0"
              />
            ) : (
              <Badge className="shrink-0 bg-surface-muted text-foreground-muted">
                No score
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
