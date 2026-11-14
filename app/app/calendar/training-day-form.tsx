"use client";


import { type TrainingVolumeMode } from "@/lib/calendar-access";
import { type ExerciseMetric } from "@/lib/user-exercise-utils";
import { type TrainingExerciseKey } from "@/lib/training-exercises";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export { Stepper } from "@/components/ui/stepper";

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
