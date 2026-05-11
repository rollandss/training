"use client";

import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatRestTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TrainingRestOverlay(props: {
  totalSeconds: number;
  remainingSeconds: number;
  onSkip: () => void;
}) {
  const { totalSeconds, remainingSeconds, onSkip } = props;

  if (typeof document === "undefined") return null;

  const safeTotal = Math.max(1, totalSeconds);
  const progress = Math.min(1, Math.max(0, 1 - remainingSeconds / safeTotal));
  const size = 248;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-8 bg-primary px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-[max(env(safe-area-inset-top),1.5rem)] text-primary-foreground animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-rest-title"
      aria-describedby="training-rest-time"
    >
      <div className="text-center">
        <p id="training-rest-title" className="text-sm font-black uppercase tracking-[0.2em] opacity-80">
          Відпочинок
        </p>
        <p className="mt-2 text-xs font-semibold opacity-80">Дочекайся сигналу або пропусти таймер</p>
      </div>

      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-primary-foreground/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn(
              "text-background transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none",
            )}
          />
        </svg>
        <div
          id="training-rest-time"
          className={cn(
            "absolute inset-0 flex items-center justify-center text-5xl font-black tabular-nums sm:text-6xl",
            remainingSeconds <= 5 && "text-destructive",
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatRestTime(remainingSeconds)}
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="min-w-48 font-black uppercase tracking-wider"
        onClick={onSkip}
        aria-label="Пропустити відпочинок"
      >
        Пропустити
      </Button>
    </div>,
    document.body,
  );
}
