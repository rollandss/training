"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";

import { type TrainingVolumeMode } from "@/lib/calendar-access";
import { type ExerciseMetric } from "@/lib/user-exercise-utils";
import { type TrainingExerciseKey } from "@/lib/training-exercises";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Stepper(props: {
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
  metric: ExerciseMetric;
  maxReps: number;
  builtinKey: TrainingExerciseKey | null;
  reps: number;
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

export function moveLine(lines: TrainingExerciseLineFormValue[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= lines.length) return lines;
  const next = [...lines];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}
