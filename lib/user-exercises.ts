import "server-only";

import { TRAINING_EXERCISES, type TrainingExerciseKey } from "@/lib/training-exercises";
import { prisma } from "@/lib/prisma";

import type { UserExerciseView } from "@/lib/user-exercise-utils";

export type { TrainingExerciseLineInput, UserExerciseView } from "@/lib/user-exercise-utils";

export async function ensureUserExercises(userId: string) {
  const existing = await prisma.userExercise.findMany({
    where: { userId },
    select: { id: true, builtinKey: true },
  });
  const existingBuiltin = new Set(existing.map((row) => row.builtinKey).filter(Boolean));
  const missing = TRAINING_EXERCISES.filter((exercise) => !existingBuiltin.has(exercise.key));
  if (!missing.length) return;

  const startOrder = existing.length;
  await prisma.userExercise.createMany({
    data: missing.map((exercise, index) => ({
      userId,
      label: exercise.label,
      short: exercise.short,
      maxReps: exercise.max,
      sortOrder: startOrder + index,
      builtinKey: exercise.key,
    })),
  });
}

export async function listUserExercises(userId: string): Promise<UserExerciseView[]> {
  await ensureUserExercises(userId);
  const rows = await prisma.userExercise.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      label: true,
      short: true,
      maxReps: true,
      sortOrder: true,
      builtinKey: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    short: row.short,
    maxReps: row.maxReps,
    sortOrder: row.sortOrder,
    builtinKey: (row.builtinKey as TrainingExerciseKey | null) ?? null,
    isBuiltin: row.builtinKey != null,
  }));
}
