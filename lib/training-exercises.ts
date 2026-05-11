export type TrainingExerciseKey = "pullupsReps" | "squatsReps" | "pushupsReps" | "lungesReps";

export type TrainingRepValues = Record<TrainingExerciseKey, number>;

export const TRAINING_EXERCISES: Array<{
  key: TrainingExerciseKey;
  label: string;
  short: string;
  max: number;
}> = [
  { key: "pullupsReps", label: "Підтягування", short: "П", max: 500 },
  { key: "squatsReps", label: "Присідання", short: "Пр", max: 5000 },
  { key: "pushupsReps", label: "Віджимання", short: "Вд", max: 5000 },
  { key: "lungesReps", label: "Випади", short: "Вп", max: 5000 },
];

export const DEFAULT_TRAINING_REPS: TrainingRepValues = {
  pullupsReps: 1,
  squatsReps: 2,
  pushupsReps: 2,
  lungesReps: 2,
};

export function trainingRepsFromProfile(profile?: {
  pullupsMax: number | null;
  squatsMax: number | null;
  pushupsMax: number | null;
  lungesMax: number | null;
} | null): Partial<TrainingRepValues> {
  if (!profile) return {};
  const values: Partial<TrainingRepValues> = {};
  if (profile.pullupsMax != null) values.pullupsReps = profile.pullupsMax;
  if (profile.squatsMax != null) values.squatsReps = profile.squatsMax;
  if (profile.pushupsMax != null) values.pushupsReps = profile.pushupsMax;
  if (profile.lungesMax != null) values.lungesReps = profile.lungesMax;
  return values;
}

export function trainingRepsFromEntry(entry?: Partial<TrainingRepValues> | null): Partial<TrainingRepValues> {
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

export function resolveTrainingReps(...sources: Array<Partial<TrainingRepValues> | null | undefined>): TrainingRepValues {
  const resolved = { ...DEFAULT_TRAINING_REPS };
  for (const source of sources) {
    if (!source) continue;
    for (const exercise of TRAINING_EXERCISES) {
      const value = source[exercise.key];
      if (typeof value === "number" && Number.isFinite(value)) {
        resolved[exercise.key] = value;
      }
    }
  }
  return resolved;
}

export function maxTrainingReps(current: Partial<TrainingRepValues>, next: TrainingRepValues): TrainingRepValues {
  const merged = resolveTrainingReps(current, next);
  const result = { ...merged };
  for (const exercise of TRAINING_EXERCISES) {
    const previous = current[exercise.key];
    const value = next[exercise.key];
    if (typeof previous === "number" && Number.isFinite(previous)) {
      result[exercise.key] = Math.max(previous, value);
    }
  }
  return result;
}
