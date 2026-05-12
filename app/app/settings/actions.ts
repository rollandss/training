"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listUserExercises } from "@/lib/user-exercises";
import { TRAINING_EXERCISES } from "@/lib/training-exercises";

function parseIntField(formData: FormData, key: string, opts?: { min?: number; max?: number }) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (opts?.min != null && i < opts.min) return null;
  if (opts?.max != null && i > opts.max) return null;
  return i;
}

export async function setEmailSubscriptionEnabledAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const enabled = String(formData.get("enabled") ?? "") === "on";

  await prisma.userEmailSubscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, enabled },
    update: { enabled },
  });

  revalidatePath("/app/settings");
}

export async function updateExerciseBaselinesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const values: Record<string, number> = {};
  for (const exercise of TRAINING_EXERCISES) {
    const value = parseIntField(formData, exercise.key, { min: 0, max: exercise.max });
    if (value == null) throw new Error("Fill all exercise maximums");
    values[exercise.key] = value;
  }

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      pullupsMax: values.pullupsReps,
      squatsMax: values.squatsReps,
      pushupsMax: values.pushupsReps,
      lungesMax: values.lungesReps,
    },
    update: {
      pullupsMax: values.pullupsReps,
      squatsMax: values.squatsReps,
      pushupsMax: values.pushupsReps,
      lungesMax: values.lungesReps,
    },
  });

  revalidatePath("/app/settings");
  revalidatePath("/app/calendar");
}

function normalizeExerciseShort(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 6);
}

function normalizeExerciseLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 80);
}

export async function createUserExerciseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const label = normalizeExerciseLabel(String(formData.get("label") ?? ""));
  const short = normalizeExerciseShort(String(formData.get("short") ?? ""));
  const maxReps = parseIntField(formData, "maxReps", { min: 1, max: 5000 }) ?? 5000;
  if (!label || !short) throw new Error("Fill exercise name and short label");

  const exercises = await listUserExercises(user.id);
  const sortOrder = exercises.length;

  await prisma.userExercise.create({
    data: {
      userId: user.id,
      label,
      short,
      maxReps,
      sortOrder,
    },
  });

  revalidatePath("/app/settings");
  revalidatePath("/app/calendar");
}

export async function updateUserExerciseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "").trim();
  const label = normalizeExerciseLabel(String(formData.get("label") ?? ""));
  const short = normalizeExerciseShort(String(formData.get("short") ?? ""));
  const maxReps = parseIntField(formData, "maxReps", { min: 1, max: 5000 });
  if (!id || !label || !short || maxReps == null) throw new Error("Invalid exercise");

  const exercise = await prisma.userExercise.findFirst({
    where: { id, userId: user.id },
    select: { id: true, builtinKey: true },
  });
  if (!exercise) throw new Error("Exercise not found");

  await prisma.userExercise.update({
    where: { id: exercise.id },
    data: {
      label,
      short,
      maxReps,
    },
  });

  revalidatePath("/app/settings");
  revalidatePath("/app/calendar");
}

export async function deleteUserExerciseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Invalid exercise");

  const exercise = await prisma.userExercise.findFirst({
    where: { id, userId: user.id },
    select: { id: true, builtinKey: true },
  });
  if (!exercise) throw new Error("Exercise not found");
  if (exercise.builtinKey) throw new Error("Built-in exercises cannot be deleted");

  await prisma.userExercise.delete({ where: { id: exercise.id } });

  const remaining = await prisma.userExercise.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  await prisma.$transaction(
    remaining.map((row, index) =>
      prisma.userExercise.update({
        where: { id: row.id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath("/app/settings");
  revalidatePath("/app/calendar");
}

export async function reorderUserExercisesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const raw = String(formData.get("orderedIds") ?? "").trim();
  if (!raw) throw new Error("Missing order");

  let orderedIds: string[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) {
      throw new Error("Invalid order");
    }
    orderedIds = parsed;
  } catch {
    throw new Error("Invalid order");
  }

  const exercises = await prisma.userExercise.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  if (orderedIds.length !== exercises.length) throw new Error("Invalid order");
  const owned = new Set(exercises.map((row) => row.id));
  if (!orderedIds.every((id) => owned.has(id))) throw new Error("Invalid order");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.userExercise.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath("/app/settings");
  revalidatePath("/app/calendar");
}

