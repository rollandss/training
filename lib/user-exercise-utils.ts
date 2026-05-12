import { TRAINING_EXERCISES, type TrainingExerciseKey, type TrainingRepValues } from "@/lib/training-exercises";

export type ExerciseMetric = "REPS" | "TIME";

export type UserExerciseView = {
  id: string;
  label: string;
  short: string;
  metric: ExerciseMetric;
  maxReps: number;
  sortOrder: number;
  builtinKey: TrainingExerciseKey | null;
  isBuiltin: boolean;
};

export type TrainingExerciseLineInput = {
  exerciseId: string;
  reps: number;
};

export function formatExerciseValue(line: { short: string; reps: number; metric: ExerciseMetric }) {
  if (line.metric === "TIME") return `${line.short}${line.reps}с`;
  return `${line.short}${line.reps}`;
}

export function legacyRepsFromEntry(entry?: Partial<TrainingRepValues> | null): Partial<TrainingRepValues> {
  if (!entry) return {};
  const values: Partial<TrainingRepValues> = {};
  for (const exercise of TRAINING_EXERCISES) {
    const value = entry[exercise.key];
    if (typeof value === "number" && Number.isFinite(value)) {
      values[exercise.key] = value;
    }
  }
  return values;
}

export function repsByBuiltinKey(lines: Array<{ builtinKey: TrainingExerciseKey | null; reps: number }>) {
  const values: Partial<TrainingRepValues> = {};
  for (const line of lines) {
    if (!line.builtinKey) continue;
    values[line.builtinKey] = line.reps;
  }
  return values;
}

export function buildTrainingLinesForForm(
  exercises: UserExerciseView[],
  savedLines: Array<{ userExerciseId: string; reps: number; sortOrder: number }> | null | undefined,
  repDefaults: Partial<TrainingRepValues>,
  legacyEntry?: Partial<TrainingRepValues> | null,
) {
  const byExerciseId = new Map((savedLines ?? []).map((line) => [line.userExerciseId, line]));
  const ordered = savedLines?.length
    ? [...savedLines]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((line) => exercises.find((exercise) => exercise.id === line.userExerciseId))
        .filter((exercise): exercise is UserExerciseView => Boolean(exercise))
    : exercises;

  return ordered.map((exercise) => {
    const saved = byExerciseId.get(exercise.id);
    const legacyValue = exercise.builtinKey ? legacyEntry?.[exercise.builtinKey] : undefined;
    const defaultValue = exercise.builtinKey ? repDefaults[exercise.builtinKey] : exercise.metric === "TIME" ? 30 : 0;
    return {
      exerciseId: exercise.id,
      label: exercise.label,
      short: exercise.short,
      metric: exercise.metric,
      maxReps: exercise.maxReps,
      builtinKey: exercise.builtinKey,
      reps: saved?.reps ?? legacyValue ?? defaultValue ?? 0,
    };
  });
}

export function summarizeTrainingLines(lines: Array<{ short: string; reps: number; metric: ExerciseMetric }>) {
  return lines.map((line) => formatExerciseValue(line)).join(" · ");
}
