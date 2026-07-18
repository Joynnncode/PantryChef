import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
