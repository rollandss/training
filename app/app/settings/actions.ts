"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

