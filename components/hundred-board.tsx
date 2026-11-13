import Link from "next/link";

import { cn } from "@/lib/utils";

export type BoardMark = "TRAINING" | "STRETCHING" | "REST" | "SICK";

const MARK_CLASS: Record<BoardMark, string> = {
  TRAINING: "bg-primary",
  STRETCHING: "bg-accent",
  REST: "bg-secondary",
  SICK: "bg-destructive",
};

const LEGEND: { mark: BoardMark; label: string }[] = [
  { mark: "TRAINING", label: "Тренування" },
  { mark: "STRETCHING", label: "Розтяжка" },
  { mark: "REST", label: "Відпочинок" },
  { mark: "SICK", label: "Хвороба" },
];

type Props = {
  /** Program day (1..100) → mark. */
  marks: Map<number, BoardMark>;
  /** Current program day; days after it are not open yet. */
  today: number;
  /** Fill-in animation on load (landing only). */
  animate?: boolean;
  /** Make each open cell a link (e.g. to the calendar day). */
  hrefForDay?: (day: number) => string | null;
  label: string;
  className?: string;
  compact?: boolean;
};

export function HundredBoard({ marks, today, animate, hrefForDay, label, className, compact }: Props) {
  return (
    <figure className={cn("w-full", className)}>
      <div
        className={cn(
          "grid grid-cols-10 rounded-[var(--radius)] border-4 border-border bg-card shadow-[10px_10px_0px_0px_var(--color-border)]",
          compact ? "gap-1 p-2" : "gap-1 p-2 sm:gap-1.5 sm:p-3",
        )}
        role={hrefForDay ? undefined : "img"}
        aria-label={hrefForDay ? undefined : label}
      >
        {Array.from({ length: 100 }, (_, i) => {
          const day = i + 1;
          const mark = marks.get(day);
          const isToday = day === today;
          const isFuture = day > today;
          const cellClass = cn(
            "relative flex aspect-square items-end justify-start rounded-[3px] p-[3px] text-[9px] font-bold leading-none tabular-nums sm:text-[10px]",
            mark
              ? cn("border-2 border-border text-foreground", MARK_CLASS[mark], animate && "board-cell-filled")
              : isFuture
                ? "border-2 border-dashed border-border/25 text-foreground/35"
                : "border-2 border-border/60 bg-background/40 text-foreground/70",
            isToday && "border-solid border-border bg-foreground text-background outline-2 outline-offset-2 outline-border",
          );
          const href = !isFuture ? hrefForDay?.(day) : null;
          return href ? (
            <Link
              key={day}
              href={href}
              className={cn(cellClass, "outline-none focus-visible:ring-4 focus-visible:ring-ring/60 hover:-translate-y-px")}
              aria-label={`День ${day}${mark ? `: ${LEGEND.find((l) => l.mark === mark)?.label}` : ""}${isToday ? ", сьогодні" : ""}`}
            >
              {day}
            </Link>
          ) : (
            <div key={day} style={animate && mark ? ({ "--i": i } as React.CSSProperties) : undefined} className={cellClass}>
              {day}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        {LEGEND.map(({ mark, label: text }) => (
          <span key={mark} className="inline-flex items-center gap-2">
            <span className={cn("size-3.5 rounded-[3px] border-2 border-border", MARK_CLASS[mark])} aria-hidden />
            {text}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="size-3.5 rounded-[3px] border-2 border-border bg-foreground" aria-hidden />
          Сьогодні
        </span>
      </figcaption>
    </figure>
  );
}
