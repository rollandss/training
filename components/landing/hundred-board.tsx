import { cn } from "@/lib/utils";

type Mark = "TRAINING" | "STRETCHING" | "REST" | "SICK";

// A plausible first five weeks: train 5 days, stretch on day 6, rest on day 7, one sick day.
const TODAY = 38;
function markFor(day: number): Mark | null {
  if (day >= TODAY) return null;
  if (day === 23 || day === 24) return "SICK";
  if (day % 7 === 0) return "REST";
  if (day % 7 === 6) return "STRETCHING";
  return "TRAINING";
}

const MARK_CLASS: Record<Mark, string> = {
  TRAINING: "bg-primary",
  STRETCHING: "bg-accent",
  REST: "bg-secondary",
  SICK: "bg-destructive",
};

const LEGEND: { mark: Mark; label: string }[] = [
  { mark: "TRAINING", label: "Тренування" },
  { mark: "STRETCHING", label: "Розтяжка" },
  { mark: "REST", label: "Відпочинок" },
  { mark: "SICK", label: "Хвороба" },
];

export function HundredBoard({ className }: { className?: string }) {
  return (
    <figure className={cn("w-full", className)}>
      <div
        className="grid grid-cols-10 gap-1 rounded-[var(--radius)] border-4 border-border bg-card p-2 shadow-[10px_10px_0px_0px_var(--color-border)] sm:gap-1.5 sm:p-3"
        role="img"
        aria-label={`Приклад календаря Стоденки: відмічено ${TODAY - 1} днів зі 100, сьогодні день ${TODAY}`}
      >
        {Array.from({ length: 100 }, (_, i) => {
          const day = i + 1;
          const mark = markFor(day);
          const isToday = day === TODAY;
          return (
            <div
              key={day}
              style={mark ? ({ "--i": i } as React.CSSProperties) : undefined}
              className={cn(
                "relative flex aspect-square items-end justify-start rounded-[3px] p-[3px] text-[9px] font-bold leading-none tabular-nums sm:text-[10px]",
                mark
                  ? cn("board-cell-filled border-2 border-border text-foreground", MARK_CLASS[mark])
                  : "border-2 border-dashed border-border/25 text-foreground/35",
                isToday && "border-solid border-border bg-foreground text-background outline-2 outline-offset-2 outline-border",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        {LEGEND.map(({ mark, label }) => (
          <span key={mark} className="inline-flex items-center gap-2">
            <span className={cn("size-3.5 rounded-[3px] border-2 border-border", MARK_CLASS[mark])} aria-hidden />
            {label}
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="size-3.5 rounded-[3px] border-2 border-border bg-foreground outline-2 outline-offset-1 outline-border" aria-hidden />
          Сьогодні
        </span>
      </figcaption>
    </figure>
  );
}
