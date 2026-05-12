"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { MotionReveal } from "@/components/motion-ui";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { DEFAULT_TRAINING_REPS, TRAINING_EXERCISES, type TrainingRepValues } from "@/lib/training-exercises";
import { cn } from "@/lib/utils";

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

export function ExerciseBaselineForm(props: { initial?: Partial<TrainingRepValues> }) {
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
      <div className="grid gap-3">
        {TRAINING_EXERCISES.map((exercise, index) => (
          <MotionReveal key={exercise.key} delay={index * 0.04}>
            <div className="flex items-center gap-3 rounded-[var(--radius)] border-4 border-border bg-card px-3 py-3 shadow-[6px_6px_0px_0px_var(--color-border)]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-sm font-black shadow-[4px_4px_0px_0px_var(--color-border)]">
              {exercise.short}
            </div>
            <div className="min-w-0 flex-1">
              <Label className={cn("text-sm font-black leading-tight")}>{exercise.label}</Label>
              <div className="text-xs font-semibold text-muted-foreground">Максимум повторень за підхід</div>
            </div>
            <Stepper
              value={values[exercise.key]}
              min={0}
              max={exercise.max}
              ariaLabel={exercise.label}
              onChange={(next) => setValues((current) => ({ ...current, [exercise.key]: next }))}
            />
            </div>
          </MotionReveal>
        ))}
      </div>
      <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
        Зберегти максимуми
      </SubmitButton>
    </form>
  );
}
