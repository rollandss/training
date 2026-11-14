"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** − value + control. One look for maximums, plan targets and live session counters. */
export function Stepper(props: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  /** Text after the number, e.g. "с". */
  suffix?: string;
  className?: string;
}) {
  const { value, min, max, step = 1, onChange, ariaLabel, suffix, className } = props;
  const btn =
    "flex w-10 items-center justify-center bg-card transition-colors hover:bg-muted outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring/50 disabled:opacity-40";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-10 shrink-0 items-stretch overflow-hidden rounded-[var(--radius)] border-2 border-border bg-input",
        className,
      )}
    >
      <button
        type="button"
        className={cn(btn, "border-r-2 border-border")}
        onClick={() => onChange(clamp(value - step, min, max))}
        disabled={value <= min}
        aria-label={`${ariaLabel}: зменшити`}
      >
        <Minus className="size-4" />
      </button>
      <output className="flex min-w-12 items-center justify-center px-2 text-base font-black tabular-nums" aria-live="polite">
        {value}
        {suffix ? <span className="ml-0.5 text-xs font-bold">{suffix}</span> : null}
      </output>
      <button
        type="button"
        className={cn(btn, "border-l-2 border-border")}
        onClick={() => onChange(clamp(value + step, min, max))}
        disabled={value >= max}
        aria-label={`${ariaLabel}: збільшити`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
