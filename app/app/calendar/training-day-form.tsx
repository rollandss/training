"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TrainingVolumeMode } from "@/lib/calendar-access";
import { type TrainingExerciseKey } from "@/lib/training-exercises";
import { cn } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Stepper(props: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  const { value, min, max, onChange, ariaLabel } = props;

  return (
    <motion.div
      layout
      className="inline-flex shrink-0 items-stretch overflow-hidden rounded-[var(--radius)] border-4 border-border bg-background shadow-[4px_4px_0px_0px_var(--color-border)]"
    >
      <button
        type="button"
        className="flex w-9 items-center justify-center border-r-4 border-border bg-background text-base font-black transition-colors hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1, min, max))}
        disabled={value <= min}
        aria-label={`${ariaLabel}: зменшити`}
      >
        <Minus className="size-4" />
      </button>
      <motion.div
        key={value}
        initial={{ opacity: 0.6, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-w-10 items-center justify-center px-1.5 text-base font-black tabular-nums"
      >
        {value}
      </motion.div>
      <button
        type="button"
        className="flex w-9 items-center justify-center border-l-4 border-border bg-background text-base font-black transition-colors hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1, min, max))}
        disabled={value >= max}
        aria-label={`${ariaLabel}: збільшити`}
      >
        <Plus className="size-4" />
      </button>
    </motion.div>
  );
}

export type TrainingExerciseLineFormValue = {
  exerciseId: string;
  label: string;
  short: string;
  maxReps: number;
  builtinKey: TrainingExerciseKey | null;
  reps: number;
  isNew?: boolean;
};

export type TrainingDayFormValue = {
  mode: TrainingVolumeMode;
  rounds: number;
  lines: TrainingExerciseLineFormValue[];
};

export type TrainingVolumeProgress = {
  mode: TrainingVolumeMode;
  active: number;
  rounds: number;
};

function moveLine(lines: TrainingExerciseLineFormValue[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= lines.length) return lines;
  const next = [...lines];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function TrainingDayForm(props: {
  initial?: Partial<TrainingDayFormValue>;
  restSeconds: number;
  restRemaining: number | null;
  onRestSecondsChange: (seconds: number) => void;
  onStartRest: () => void;
  onActiveVolumeChange?: (progress: TrainingVolumeProgress) => void;
}) {
  const { initial, restSeconds, restRemaining, onRestSecondsChange, onStartRest, onActiveVolumeChange } = props;
  const reduceMotion = useReducedMotion();

  const [mode, setModeState] = React.useState<TrainingVolumeMode>(initial?.mode ?? "ROUNDS");
  const [rounds, setRoundsState] = React.useState(initial?.rounds ?? 4);
  const [lines, setLines] = React.useState<TrainingExerciseLineFormValue[]>(initial?.lines ?? []);
  const [activeVolume, setActiveVolume] = React.useState(1);
  const [draftLabel, setDraftLabel] = React.useState("");
  const [draftShort, setDraftShort] = React.useState("");
  const clampedActiveVolume = Math.max(1, Math.min(activeVolume, rounds));

  const setMode = React.useCallback((next: TrainingVolumeMode) => {
    setModeState(next);
    setActiveVolume(1);
  }, []);

  const setRounds = React.useCallback((next: number) => {
    setRoundsState(next);
    setActiveVolume((current) => Math.max(1, Math.min(current, next)));
  }, []);

  const volumeLabel = mode === "ROUNDS" ? "Кіл" : "Підходів";
  const repsLabel = mode === "ROUNDS" ? "Повтори в колі" : "Повтори в підході";
  const activeVolumeLabel = mode === "ROUNDS" ? "Коло" : "Підхід";
  const activeVolumeLabelLower = mode === "ROUNDS" ? "коло" : "підхід";
  const activeVolumeDoneLabel = mode === "ROUNDS" ? "Коло виконано" : "Підхід виконано";

  const completeActiveVolume = React.useCallback(() => {
    if (clampedActiveVolume >= rounds) return;
    setActiveVolume((current) => Math.min(rounds, current + 1));
    onStartRest();
  }, [clampedActiveVolume, onStartRest, rounds]);

  React.useEffect(() => {
    onActiveVolumeChange?.({ mode, active: clampedActiveVolume, rounds });
  }, [clampedActiveVolume, mode, onActiveVolumeChange, rounds]);

  const addCustomExercise = React.useCallback(() => {
    const label = draftLabel.trim();
    const short = draftShort.trim();
    if (!label || !short) return;
    setLines((current) => [
      ...current,
      {
        exerciseId: `new-${crypto.randomUUID()}`,
        label,
        short,
        maxReps: 5000,
        builtinKey: null,
        reps: 0,
        isNew: true,
      },
    ]);
    setDraftLabel("");
    setDraftShort("");
  }, [draftLabel, draftShort]);

  const volumeChips = (
    <motion.div layout className="flex flex-wrap gap-1.5">
      {Array.from({ length: rounds }, (_, index) => index + 1).map((volumeNumber) => {
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
              isActive && "bg-background text-foreground",
              isDone && !isActive && "bg-secondary text-secondary-foreground",
              !isActive && !isDone && "bg-primary-foreground/10 text-primary-foreground",
            )}
            aria-current={isActive ? "step" : undefined}
            aria-label={`${activeVolumeLabel} ${volumeNumber} з ${rounds}`}
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
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="rounds" value={rounds} />
      <input
        type="hidden"
        name="exerciseLinesJson"
        value={JSON.stringify(
          lines.map((line) => ({
            exerciseId: line.exerciseId,
            reps: line.reps,
            isNew: line.isNew === true,
            label: line.label,
            short: line.short,
            maxReps: line.maxReps,
          })),
        )}
      />

      <motion.div
        layout
        className="sticky top-0 z-10 -mx-4 border-b-4 border-border bg-primary px-4 py-3 text-primary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]"
        aria-live="polite"
      >
        <motion.div layout className="text-[11px] font-black uppercase tracking-wider opacity-80">
          Зараз
        </motion.div>
        <motion.div layout className="mt-1 text-2xl font-black tabular-nums">
          {activeVolumeLabel} {clampedActiveVolume} <span className="text-base opacity-80">з {rounds}</span>
        </motion.div>
        <div className="mt-3">{volumeChips}</div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="font-black uppercase tracking-wider"
            disabled={clampedActiveVolume >= rounds}
            onClick={completeActiveVolume}
          >
            {activeVolumeDoneLabel}
          </Button>
          <span className="text-[11px] font-semibold opacity-90">
            {clampedActiveVolume >= rounds
              ? `Останнє ${activeVolumeLabelLower} перед збереженням.`
              : `Після ${activeVolumeLabelLower} запуститься відпочинок.`}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 rounded-[var(--radius)] border-4 border-border bg-muted/40 p-1 shadow-[6px_6px_0px_0px_var(--color-border)]">
        {(
          [
            { id: "ROUNDS" as const, label: "Круги" },
            { id: "SETS" as const, label: "Підходи" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={cn(
              "rounded-[var(--radius)] px-2 py-2 text-xs font-black uppercase tracking-wider transition-[transform,box-shadow,background-color,color] sm:text-sm",
              mode === option.id
                ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-border)]"
                : "bg-transparent text-foreground hover:bg-background",
            )}
            aria-pressed={mode === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {lines.map((line, index) => (
            <motion.div
              key={line.exerciseId}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-card px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)] ring-2 ring-primary/25"
            >
              <motion.div
                layout
                className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-xs font-black shadow-[4px_4px_0px_0px_var(--color-border)]"
              >
                {line.short}
              </motion.div>
              <motion.div layout className="min-w-0 flex-1">
                <motion.div layout className="text-sm font-black leading-tight">
                  {line.label}
                </motion.div>
                <motion.div layout className="text-[11px] font-semibold text-muted-foreground">
                  {repsLabel} · {activeVolumeLabel} {clampedActiveVolume}
                  {line.isNew ? " · нова" : null}
                </motion.div>
              </motion.div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background shadow-[3px_3px_0px_0px_var(--color-border)] disabled:opacity-40"
                  onClick={() => setLines((current) => moveLine(current, index, -1))}
                  disabled={index === 0}
                  aria-label={`${line.label}: вгору`}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background shadow-[3px_3px_0px_0px_var(--color-border)] disabled:opacity-40"
                  onClick={() => setLines((current) => moveLine(current, index, 1))}
                  disabled={index === lines.length - 1}
                  aria-label={`${line.label}: вниз`}
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>
              <Stepper
                value={line.reps}
                min={0}
                max={line.maxReps}
                ariaLabel={line.label}
                onChange={(next) =>
                  setLines((current) =>
                    current.map((item) => (item.exerciseId === line.exerciseId ? { ...item, reps: next } : item)),
                  )
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          layout
          className="rounded-[var(--radius)] border-4 border-dashed border-border bg-background/80 p-3 shadow-[6px_6px_0px_0px_var(--color-border)]"
        >
          <motion.div layout className="flex items-center gap-2 text-sm font-black">
            <Sparkles className="size-4" />
            Своя вправа
          </motion.div>
          <div className="mt-3 grid gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="custom-exercise-label" className="text-xs">
                Назва
              </Label>
              <Input
                id="custom-exercise-label"
                value={draftLabel}
                onChange={(event) => setDraftLabel(event.target.value)}
                placeholder="Напр.: планка"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="custom-exercise-short" className="text-xs">
                Коротко
              </Label>
              <Input
                id="custom-exercise-short"
                value={draftShort}
                onChange={(event) => setDraftShort(event.target.value)}
                placeholder="Пл"
                maxLength={6}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit font-black uppercase tracking-wider"
              disabled={!draftLabel.trim() || !draftShort.trim()}
              onClick={addCustomExercise}
            >
              Додати вправу
            </Button>
          </div>
        </motion.div>

        <motion.div
          layout
          className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-background px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
            <RotateCcw className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <motion.div layout className="text-sm font-black leading-tight">
              {volumeLabel}
            </motion.div>
            <div className="text-[11px] font-semibold text-muted-foreground">
              {mode === "ROUNDS" ? "Скільки кіл зробити" : "Скільки підходів зробити"}
            </div>
          </div>
          <Stepper value={rounds} min={1} max={50} ariaLabel={volumeLabel} onChange={setRounds} />
        </motion.div>
      </div>

      <motion.div
        layout
        className="rounded-[var(--radius)] border-4 border-border bg-background p-2.5 shadow-[8px_8px_0px_0px_var(--color-border)]"
      >
        <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Таймер відпочинку</div>
        <div className="mt-2 grid gap-1.5">
          <Label htmlFor="restSeconds" className="text-xs">
            Секунди
          </Label>
          <Input
            id="restSeconds"
            type="number"
            min={10}
            max={600}
            className="h-9"
            value={restSeconds}
            disabled={restRemaining != null}
            onChange={(event) => {
              const n = Number(event.target.value);
              if (!Number.isFinite(n)) return;
              onRestSecondsChange(Math.max(10, Math.min(600, Math.floor(n))));
            }}
          />
          <p className="text-[11px] font-semibold text-muted-foreground">
            {restRemaining != null
              ? "Повноекранний відпочинок активний."
              : "Після «Коло виконано» відкриється повноекранний відлік."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
