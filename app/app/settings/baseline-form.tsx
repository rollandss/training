"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { ExerciseMark } from "@/components/exercise-mark";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { DEFAULT_TRAINING_REPS, TRAINING_EXERCISES, type TrainingRepValues } from "@/lib/training-exercises";

import { updateExerciseBaselinesAction } from "./actions";

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
    <div className="inline-flex h-10 items-stretch overflow-hidden rounded-[var(--radius)] border-2 border-border bg-input">
      <button
        type="button"
        className="flex w-10 items-center justify-center border-r-2 border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-inset disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1, min, max))}
        disabled={value <= min}
        aria-label={`${ariaLabel}: зменшити`}
      >
        <Minus className="size-4" />
      </button>
      <div className="flex min-w-12 items-center justify-center px-2 text-lg font-black tabular-nums">{value}</div>
      <button
        type="button"
        className="flex w-10 items-center justify-center border-l-2 border-border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-inset disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1, min, max))}
        disabled={value >= max}
        aria-label={`${ariaLabel}: збільшити`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function ExerciseBaselineForm(props: { initial?: Partial<TrainingRepValues>; footer?: React.ReactNode }) {
  const [values, setValues] = React.useState<TrainingRepValues>({
    pullupsReps: props.initial?.pullupsReps ?? DEFAULT_TRAINING_REPS.pullupsReps,
    squatsReps: props.initial?.squatsReps ?? DEFAULT_TRAINING_REPS.squatsReps,
    pushupsReps: props.initial?.pushupsReps ?? DEFAULT_TRAINING_REPS.pushupsReps,
    lungesReps: props.initial?.lungesReps ?? DEFAULT_TRAINING_REPS.lungesReps,
  });

  return (
    <form action={updateExerciseBaselinesAction} className="grid gap-4">
      {TRAINING_EXERCISES.map((exercise) => (
        <input key={exercise.key} type="hidden" name={exercise.key} value={values[exercise.key]} />
      ))}
      <ul className="divide-y-2 divide-border rounded-[var(--radius)] border-2 border-border bg-card">
        {TRAINING_EXERCISES.map((exercise) => (
          <li key={exercise.key} className="flex items-center gap-3 px-3 py-3">
            <ExerciseMark>{exercise.short}</ExerciseMark>
            <div className="min-w-0 flex-1">
              <Label className="text-sm font-bold leading-tight">{exercise.label}</Label>
              <div className="text-xs text-muted-foreground">Максимум повторень за підхід</div>
            </div>
            <Stepper
              value={values[exercise.key]}
              min={0}
              max={exercise.max}
              ariaLabel={exercise.label}
              onChange={(next) => setValues((current) => ({ ...current, [exercise.key]: next }))}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
          Зберегти максимуми
        </SubmitButton>
        {props.footer}
      </div>
    </form>
  );
}
