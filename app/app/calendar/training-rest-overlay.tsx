"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatRestTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function TrainingRestOverlayPanel(props: {
  totalSeconds: number;
  remainingSeconds: number;
  onSkip: () => void;
  title: string;
  subtitle: string;
  skipLabel: string;
}) {
  const { totalSeconds, remainingSeconds, onSkip, title, subtitle, skipLabel } = props;
  const reduceMotion = useReducedMotion();

  const safeTotal = Math.max(1, totalSeconds);
  const progress = Math.min(1, Math.max(0, 1 - remainingSeconds / safeTotal));
  const size = 248;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const ringTransition = reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "linear" as const };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-8 bg-primary px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-[max(env(safe-area-inset-top),1.5rem)] text-primary-foreground"
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-rest-title"
      aria-describedby="training-rest-time"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: reduceMotion ? 0 : 0.05 }}
      >
        <p id="training-rest-title" className="text-sm font-black uppercase tracking-[0.2em] opacity-80">
          {title}
        </p>
        <p className="mt-2 text-xs font-semibold opacity-80">{subtitle}</p>
      </motion.div>

      <motion.div
        className="relative flex items-center justify-center"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.08 }}
      >
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
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="square"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={ringTransition}
            className="text-background"
          />
        </svg>
        <motion.div
          id="training-rest-time"
          key={remainingSeconds}
          className={cn(
            "absolute inset-0 flex items-center justify-center text-5xl font-black tabular-nums sm:text-6xl",
            remainingSeconds <= 5 && "text-destructive",
          )}
          aria-live="polite"
          aria-atomic="true"
          initial={reduceMotion ? false : { opacity: 0.7, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          {formatRestTime(remainingSeconds)}
        </motion.div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: reduceMotion ? 0 : 0.12 }}
      >
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="min-w-48 font-black uppercase tracking-wider"
          onClick={onSkip}
          aria-label={skipLabel}
        >
          {skipLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export function TrainingRestOverlayPresence(props: {
  open: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  onSkip: () => void;
  title?: string;
  subtitle?: string;
  skipLabel?: string;
}) {
  const {
    open,
    totalSeconds,
    remainingSeconds,
    onSkip,
    title = "Відпочинок",
    subtitle = "Дочекайся сигналу або пропусти таймер",
    skipLabel = "Пропустити",
  } = props;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <TrainingRestOverlayPanel
          key="training-rest"
          totalSeconds={totalSeconds}
          remainingSeconds={remainingSeconds}
          onSkip={onSkip}
          title={title}
          subtitle={subtitle}
          skipLabel={skipLabel}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
