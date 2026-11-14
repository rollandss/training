"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

/** Pick one of a few options. Visually matches SegmentedNav (filter links). */
export function SegmentedControl<T extends string>(props: {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const { value, options, onChange, label, className } = props;
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 items-center rounded-[var(--radius)] border-2 border-border px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/50",
              active ? "bg-foreground text-background" : "bg-card hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
