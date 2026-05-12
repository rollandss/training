"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Timer } from "lucide-react";

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
  const activeVolumeLabelLower = value.mode === "ROUNDS" ? "коло" : "підхід";
  const activeVolumeDoneLabel = value.mode === "ROUNDS" ? "Коло виконано" : "Підхід виконано";
  const repsLabel = value.mode === "ROUNDS" ? "Повтори в колі" : "Повтори в підході";

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
              "inline-flex min-w-9 items-center justify-center rounded-[var(--radius)] border-4 border-border px-2 py-1 text-sm font-black tabular-nums shadow-[4px_4px_0px_0px_var(--color-border)] transition-[transform,box-shadow,background-color,color]",
              isActive && "bg-card text-foreground",
              isDone && !isActive && "bg-secondary text-secondary-foreground",
              !isActive && !isDone && "bg-primary-foreground/10 text-primary-foreground",
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
        className="sticky top-0 z-10 -mx-4 border-b-4 border-border bg-primary px-4 py-3 text-primary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]"
        aria-live="polite"
      >
        <div className="text-[11px] font-black uppercase tracking-wider opacity-80">Зараз</div>
        <div className="mt-1 text-2xl font-black tabular-nums">
          {activeVolumeLabel} {clampedActiveVolume} <span className="text-base opacity-80">з {value.rounds}</span>
        </div>
        <div className="mt-3">{volumeChips}</div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="font-black uppercase tracking-wider"
            disabled={clampedActiveVolume >= value.rounds}
            onClick={completeActiveVolume}
          >
            {activeVolumeDoneLabel}
          </Button>
          <span className="text-[11px] font-semibold opacity-90">
            {clampedActiveVolume >= value.rounds
              ? `Останнє ${activeVolumeLabelLower} перед збереженням.`
              : `Після ${activeVolumeLabelLower} запуститься відпочинок.`}
          </span>
        </div>
      </motion.div>

      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {value.lines.map((line) => (
            <motion.div
              key={line.exerciseId}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-card px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)] ring-2 ring-primary/25"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-xs font-black shadow-[4px_4px_0px_0px_var(--color-border)]">
                {line.short}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black leading-tight">{line.label}</div>
                <div className="text-[11px] font-semibold text-muted-foreground">
                  {line.metric === "TIME" ? "Секунди в колі" : repsLabel} · {activeVolumeLabel} {clampedActiveVolume}
                </div>
              </div>
              <Stepper
                value={line.reps}
                min={line.metric === "TIME" ? 5 : 0}
                max={line.maxReps}
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
                  size="sm"
                  variant="outline"
                  className="shrink-0 font-black uppercase tracking-wider"
                  disabled={line.reps < 5 || restRemaining != null}
                  onClick={() => onStartExerciseTimer({ label: line.label, seconds: line.reps })}
                >
                  <Timer className="size-4" />
                  Таймер
                </Button>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
