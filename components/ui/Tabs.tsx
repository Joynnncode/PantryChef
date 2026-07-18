"use client";

import { cn } from "@/lib/utils/cn";
import { useState, type ReactNode } from "react";

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, defaultKey }: { items: TabItem[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key);
  const activeItem = items.find((item) => item.key === active);

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              active === item.key
                ? "border-primary-500 text-primary-700"
                : "border-transparent text-foreground-muted hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{activeItem?.content}</div>
    </div>
  );
}
