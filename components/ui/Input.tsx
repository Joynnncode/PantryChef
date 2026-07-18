import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100",
        className
      )}
      {...props}
    />
  );
}
