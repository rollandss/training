import { cn } from "@/lib/utils";

/** Square tile with an exercise's short code (П, Пр, Вд…). Same everywhere exercises are listed. */
export function ExerciseMark({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border-2 border-border bg-secondary text-sm font-black text-secondary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
