"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Timer } from "lucide-react";

import { ExerciseMark } from "@/components/exercise-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Stepper, type TrainingDayFormValue, type TrainingVolumeProgress } from "./training-day-form";

export function TrainingDaySessionForm(props: {
  value: TrainingDayFormValue;
  restRemaining: number | null;
  onChange: (value: TrainingDayFormValue) => void;
  onStartRest: () => void;
  onStartExerciseTimer: (payload: { label: string; seconds: number }) => void;
  onActiveVolumeChange?: (progress: TrainingVolumeProgress) => void;
}) {
  const { value, restRemaining, onChange, onStartRest, onStartExerciseTimer, onActiveVolumeChange } = props;
  const reduceMotion = useReducedMotion();
  const [activeVolume, setActiveVolume] = React.useState(1);
  const clampedActiveVolume = Math.max(1, Math.min(activeVolume, value.rounds));

  const activeVolumeLabel = value.mode === "ROUNDS" ? "Коло" : "Підхід";
  const isLast = clampedActiveVolume >= value.rounds;
  const volumeHint =
    value.mode === "ROUNDS"
      ? isLast
        ? "Останнє коло. Після нього збережи заняття."
        : "Після кола запуститься відпочинок."
      : isLast
        ? "Останній підхід. Після нього збережи заняття."
        : "Після підходу запуститься відпочинок.";
  const activeVolumeDoneLabel = value.mode === "ROUNDS" ? "Коло виконано" : "Підхід виконано";
  const repsLabel = value.mode === "ROUNDS" ? "Повторів у колі" : "Повторів у підході";

  React.useEffect(() => {
    onActiveVolumeChange?.({ mode: value.mode, active: clampedActiveVolume, rounds: value.rounds });
  }, [clampedActiveVolume, onActiveVolumeChange, value.mode, value.rounds]);

  const completeActiveVolume = React.useCallback(() => {
    if (clampedActiveVolume >= value.rounds) return;
    setActiveVolume((current) => Math.min(value.rounds, current + 1));
    onStartRest();
  }, [clampedActiveVolume, onStartRest, value.rounds]);

  const volumeChips = (
    <motion.div layout className="flex flex-wrap gap-1.5">
      {Array.from({ length: value.rounds }, (_, index) => index + 1).map((volumeNumber) => {
        const isActive = volumeNumber === clampedActiveVolume;
        const isDone = volumeNumber < clampedActiveVolume;
        return (
          <motion.button
            key={volumeNumber}
            layout
            type="button"
            onClick={() => setActiveVolume(volumeNumber)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius)] border-2 border-border px-2 text-sm font-black tabular-nums outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/50",
              isActive && "bg-foreground text-background",
              isDone && !isActive && "bg-card text-foreground line-through decoration-2",
              !isActive && !isDone && "bg-transparent text-primary-foreground",
            )}
            aria-current={isActive ? "step" : undefined}
            aria-label={`${activeVolumeLabel} ${volumeNumber} з ${value.rounds}`}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          >
            {volumeNumber}
          </motion.button>
        );
      })}
    </motion.div>
  );

  return (
    <motion.div layout className="grid gap-3">
      <motion.div
        layout
        className="sticky top-0 z-10 -mx-4 -mt-3 border-b-2 border-border bg-primary px-4 py-4 text-primary-foreground"
        aria-live="polite"
      >
        <div className="text-xs font-bold">Зараз</div>
        <div className="font-display mt-1 text-2xl font-black tabular-nums">
          {activeVolumeLabel} {clampedActiveVolume} <span className="text-base opacity-80">з {value.rounds}</span>
        </div>
        <div className="mt-3">{volumeChips}</div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" disabled={isLast} onClick={completeActiveVolume}>
            {activeVolumeDoneLabel}
          </Button>
          <span className="text-xs font-medium">{volumeHint}</span>
        </div>
      </motion.div>

      <ul className="divide-y-2 divide-border rounded-[var(--radius)] border-2 border-border bg-card">
        <AnimatePresence initial={false} mode="popLayout">
          {value.lines.map((line) => (
            <motion.li
              key={line.exerciseId}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap items-center gap-3 px-3 py-3"
            >
              <ExerciseMark>{line.short}</ExerciseMark>
              <div className="min-w-[8rem] flex-1">
                <div className="text-sm font-bold leading-tight">{line.label}</div>
                <div className="text-xs text-muted-foreground">{line.metric === "TIME" ? "Секунд" : repsLabel}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Stepper
                  value={line.reps}
                  min={line.metric === "TIME" ? 5 : 0}
                  max={line.maxReps}
                  suffix={line.metric === "TIME" ? "с" : undefined}
                  ariaLabel={line.label}
                  onChange={(reps) =>
                    onChange({
                      ...value,
                      lines: value.lines.map((item) => (item.exerciseId === line.exerciseId ? { ...item, reps } : item)),
                    })
                  }
                />
                {line.metric === "TIME" ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={line.reps < 5 || restRemaining != null}
                    onClick={() => onStartExerciseTimer({ label: line.label, seconds: line.reps })}
                    aria-label={`${line.label}: запустити таймер`}
                  >
                    <Timer className="size-4" />
                  </Button>
                ) : null}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}
