"use client";

import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TrainingVolumeMode } from "@/lib/calendar-access";
import { DEFAULT_TRAINING_REPS, TRAINING_EXERCISES, type TrainingRepValues } from "@/lib/training-exercises";
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
    <div className="inline-flex shrink-0 items-stretch overflow-hidden rounded-[var(--radius)] border-4 border-border bg-background shadow-[4px_4px_0px_0px_var(--color-border)]">
      <button
        type="button"
        className="flex w-9 items-center justify-center border-r-4 border-border bg-background text-base font-black transition-colors hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1, min, max))}
        disabled={value <= min}
        aria-label={`${ariaLabel}: зменшити`}
      >
        <Minus className="size-4" />
      </button>
      <div className="flex min-w-10 items-center justify-center px-1.5 text-base font-black tabular-nums">{value}</div>
      <button
        type="button"
        className="flex w-9 items-center justify-center border-l-4 border-border bg-background text-base font-black transition-colors hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1, min, max))}
        disabled={value >= max}
        aria-label={`${ariaLabel}: збільшити`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export type TrainingDayFormValue = {
  mode: TrainingVolumeMode;
  rounds: number;
  pullupsReps: number;
  squatsReps: number;
  pushupsReps: number;
  lungesReps: number;
  notes: string;
};

export type TrainingVolumeProgress = {
  mode: TrainingVolumeMode;
  active: number;
  rounds: number;
};

export function TrainingDayForm(props: {
  initial?: Partial<TrainingDayFormValue>;
  restSeconds: number;
  restRemaining: number | null;
  onRestSecondsChange: (seconds: number) => void;
  onStartRest: () => void;
  onStopRest: () => void;
  onActiveVolumeChange?: (progress: TrainingVolumeProgress) => void;
}) {
  const { initial, restSeconds, restRemaining, onRestSecondsChange, onStartRest, onStopRest, onActiveVolumeChange } = props;

  const [mode, setModeState] = React.useState<TrainingVolumeMode>(initial?.mode ?? "ROUNDS");
  const [rounds, setRoundsState] = React.useState(initial?.rounds ?? 4);
  const [values, setValues] = React.useState<TrainingRepValues>({
    pullupsReps: initial?.pullupsReps ?? DEFAULT_TRAINING_REPS.pullupsReps,
    squatsReps: initial?.squatsReps ?? DEFAULT_TRAINING_REPS.squatsReps,
    pushupsReps: initial?.pushupsReps ?? DEFAULT_TRAINING_REPS.pushupsReps,
    lungesReps: initial?.lungesReps ?? DEFAULT_TRAINING_REPS.lungesReps,
  });
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [activeVolume, setActiveVolume] = React.useState(1);
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

  const volumeChips = (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: rounds }, (_, index) => index + 1).map((volumeNumber) => {
        const isActive = volumeNumber === clampedActiveVolume;
        const isDone = volumeNumber < clampedActiveVolume;
        return (
          <button
            key={volumeNumber}
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
          >
            {volumeNumber}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="grid gap-3">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="rounds" value={rounds} />
      {TRAINING_EXERCISES.map((exercise) => (
        <input key={exercise.key} type="hidden" name={exercise.key} value={values[exercise.key]} />
      ))}

      <div
        className="sticky top-0 z-10 -mx-4 border-b-4 border-border bg-primary px-4 py-3 text-primary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]"
        aria-live="polite"
      >
        <div className="text-[11px] font-black uppercase tracking-wider opacity-80">Зараз</div>
        <div className="mt-1 text-2xl font-black tabular-nums">
          {activeVolumeLabel} {clampedActiveVolume} <span className="text-base opacity-80">з {rounds}</span>
        </div>
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
      </div>

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
        {TRAINING_EXERCISES.map((exercise) => (
          <div
            key={exercise.key}
            className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-card px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)] ring-2 ring-primary/35"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-xs font-black shadow-[4px_4px_0px_0px_var(--color-border)]">
              {exercise.short}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black leading-tight">{exercise.label}</div>
              <div className="text-[11px] font-semibold text-muted-foreground">
                {repsLabel} · {activeVolumeLabel} {clampedActiveVolume}
              </div>
            </div>
            <Stepper
              value={values[exercise.key]}
              min={0}
              max={exercise.max}
              ariaLabel={exercise.label}
              onChange={(next) => setValues((current) => ({ ...current, [exercise.key]: next }))}
            />
          </div>
        ))}

        <div className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-background px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
            <RotateCcw className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black leading-tight">{volumeLabel}</div>
            <div className="text-[11px] font-semibold text-muted-foreground">
              {mode === "ROUNDS" ? "Скільки кіл зробити" : "Скільки підходів зробити"}
            </div>
          </div>
          <Stepper value={rounds} min={1} max={50} ariaLabel={volumeLabel} onChange={setRounds} />
        </div>
      </div>

      <div className="rounded-[var(--radius)] border-4 border-border bg-background p-2.5 shadow-[8px_8px_0px_0px_var(--color-border)]">
        <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Таймер відпочинку</div>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <div>
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
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onRestSecondsChange(Math.max(10, Math.min(600, Math.floor(n))));
              }}
            />
          </div>
          <div className="text-right">
            <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Залишилось</div>
            <div className={cn("text-xl font-black tabular-nums", restRemaining != null && restRemaining <= 5 && "text-destructive")}>
              {String(Math.floor((restRemaining ?? restSeconds) / 60)).padStart(2, "0")}:
              {String((restRemaining ?? restSeconds) % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" size="sm" className="font-black uppercase tracking-wider" onClick={onStartRest}>
            Старт
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="font-black uppercase tracking-wider"
            disabled={restRemaining == null}
            onClick={onStopRest}
          >
            Пропустити
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes" className="text-xs">
          Нотатки (опц.)
        </Label>
        <Input
          id="notes"
          name="notes"
          className="h-9"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Напр.: важко на останніх колах..."
        />
      </div>
    </div>
  );
}
