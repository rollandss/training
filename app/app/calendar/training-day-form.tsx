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
    <div className="inline-flex items-stretch overflow-hidden rounded-[var(--radius)] border-4 border-border bg-background shadow-[4px_4px_0px_0px_var(--color-border)]">
      <button
        type="button"
        className="flex w-10 items-center justify-center border-r-4 border-border bg-background text-lg font-black transition-colors hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1, min, max))}
        disabled={value <= min}
        aria-label={`${ariaLabel}: зменшити`}
      >
        <Minus className="size-4" />
      </button>
      <div className="flex min-w-12 items-center justify-center px-2 text-lg font-black tabular-nums">{value}</div>
      <button
        type="button"
        className="flex w-10 items-center justify-center border-l-4 border-border bg-background text-lg font-black transition-colors hover:bg-muted disabled:opacity-40"
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

export function TrainingDayForm(props: {
  initial?: Partial<TrainingDayFormValue>;
  restSeconds: number;
  restRemaining: number | null;
  onRestSecondsChange: (seconds: number) => void;
  onStartRest: () => void;
  onStopRest: () => void;
}) {
  const { initial, restSeconds, restRemaining, onRestSecondsChange, onStartRest, onStopRest } = props;

  const [mode, setMode] = React.useState<TrainingVolumeMode>(initial?.mode ?? "ROUNDS");
  const [rounds, setRounds] = React.useState(initial?.rounds ?? 4);
  const [values, setValues] = React.useState<TrainingRepValues>({
    pullupsReps: initial?.pullupsReps ?? DEFAULT_TRAINING_REPS.pullupsReps,
    squatsReps: initial?.squatsReps ?? DEFAULT_TRAINING_REPS.squatsReps,
    pushupsReps: initial?.pushupsReps ?? DEFAULT_TRAINING_REPS.pushupsReps,
    lungesReps: initial?.lungesReps ?? DEFAULT_TRAINING_REPS.lungesReps,
  });
  const [notes, setNotes] = React.useState(initial?.notes ?? "");

  const volumeLabel = mode === "ROUNDS" ? "Кіл" : "Підходів";
  const repsLabel = mode === "ROUNDS" ? "Повтори в колі" : "Повтори в підході";

  return (
    <div className="grid gap-4">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="rounds" value={rounds} />
      {TRAINING_EXERCISES.map((exercise) => (
        <input key={exercise.key} type="hidden" name={exercise.key} value={values[exercise.key]} />
      ))}

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
              "rounded-[var(--radius)] px-3 py-2 text-sm font-black uppercase tracking-wider transition-[transform,box-shadow,background-color,color]",
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

      <div className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto overscroll-contain pr-1">
        {TRAINING_EXERCISES.map((exercise) => (
          <div
            key={exercise.key}
            className="flex items-center gap-3 rounded-[var(--radius)] border-4 border-border bg-card px-3 py-3 shadow-[6px_6px_0px_0px_var(--color-border)]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-sm font-black shadow-[4px_4px_0px_0px_var(--color-border)]">
              {exercise.short}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black leading-tight">{exercise.label}</div>
              <div className="text-xs font-semibold text-muted-foreground">{repsLabel}</div>
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

        <div className="flex items-center gap-3 rounded-[var(--radius)] border-4 border-border bg-background px-3 py-3 shadow-[6px_6px_0px_0px_var(--color-border)]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
            <RotateCcw className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black leading-tight">{volumeLabel}</div>
            <div className="text-xs font-semibold text-muted-foreground">
              {mode === "ROUNDS" ? "Скільки кіл зробити" : "Скільки підходів зробити"}
            </div>
          </div>
          <Stepper value={rounds} min={1} max={50} ariaLabel={volumeLabel} onChange={setRounds} />
        </div>
      </div>

      <div className="rounded-[var(--radius)] border-4 border-border bg-background p-3 shadow-[8px_8px_0px_0px_var(--color-border)]">
        <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Таймер відпочинку</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="restSeconds">Секунди</Label>
            <Input
              id="restSeconds"
              type="number"
              min={10}
              max={600}
              value={restSeconds}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onRestSecondsChange(Math.max(10, Math.min(600, Math.floor(n))));
              }}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Залишилось</div>
            <div className={cn("text-2xl font-black tabular-nums", restRemaining != null && restRemaining <= 5 && "text-destructive")}>
              {String(Math.floor((restRemaining ?? restSeconds) / 60)).padStart(2, "0")}:
              {String((restRemaining ?? restSeconds) % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" className="font-black uppercase tracking-wider" onClick={onStartRest}>
            Старт відпочинку
          </Button>
          <Button type="button" variant="secondary" className="font-black uppercase tracking-wider" disabled={restRemaining == null} onClick={onStopRest}>
            Стоп / скинути
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">Нотатки (опц.)</Label>
        <Input
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Напр.: важко на останніх колах..."
        />
      </div>
    </div>
  );
}
