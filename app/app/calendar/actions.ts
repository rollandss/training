"use server";

import { revalidatePath } from "next/cache";

import { isCalendarDayEditable, type TrainingVolumeMode } from "@/lib/calendar-access";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TRAINING_REPS, maxTrainingReps, trainingRepsFromProfile, type TrainingRepValues } from "@/lib/training-exercises";
import { listUserExercises, type TrainingExerciseLineInput } from "@/lib/user-exercises";

export type CalendarStatus = "TRAINING" | "STRETCHING" | "REST" | "SICK";
export type CalendarStatusOrNone = CalendarStatus | "NONE";

type ParsedExerciseLine = TrainingExerciseLineInput & {
  isNew?: boolean;
  label?: string;
  short?: string;
  maxReps?: number;
};

function assertDayKey(dayKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    throw new Error("Invalid dayKey");
  }
}

function assertStatus(status: string): asserts status is CalendarStatusOrNone {
  if (status !== "NONE" && status !== "TRAINING" && status !== "STRETCHING" && status !== "REST" && status !== "SICK") {
    throw new Error("Invalid status");
  }
}

function assertTrainingMode(mode: string): asserts mode is TrainingVolumeMode {
  if (mode !== "ROUNDS" && mode !== "SETS") {
    throw new Error("Invalid training mode");
  }
}

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

function parseExerciseLines(formData: FormData): ParsedExerciseLine[] {
  const raw = String(formData.get("exerciseLinesJson") ?? "").trim();
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid exercise lines");
  }

  if (!Array.isArray(parsed) || !parsed.length) {
    throw new Error("Fill reps for all exercises");
  }

  return parsed.map((line, index) => {
    if (!line || typeof line !== "object") throw new Error("Invalid exercise lines");
    const record = line as Record<string, unknown>;
    const exerciseId = String(record.exerciseId ?? "").trim();
    const reps = Number(record.reps);
    if (!exerciseId || !Number.isFinite(reps)) throw new Error("Invalid exercise lines");
    const normalizedReps = Math.floor(reps);
    if (normalizedReps < 0 || normalizedReps > 5000) throw new Error("Invalid exercise lines");

    const isNew = record.isNew === true;
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const short = typeof record.short === "string" ? record.short.trim() : "";
    const maxReps = Number(record.maxReps);
    if (isNew && (!label || !short)) throw new Error(`Fill new exercise ${index + 1}`);

    return {
      exerciseId,
      reps: normalizedReps,
      isNew,
      label: label || undefined,
      short: short || undefined,
      maxReps: Number.isFinite(maxReps) ? Math.floor(maxReps) : undefined,
    };
  });
}

function legacyRepsFromLines(
  lines: Array<{ exerciseId: string; reps: number }>,
  exercises: Awaited<ReturnType<typeof listUserExercises>>,
): TrainingRepValues {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const values = { ...DEFAULT_TRAINING_REPS };
  for (const line of lines) {
    const exercise = byId.get(line.exerciseId);
    if (!exercise?.builtinKey) continue;
    values[exercise.builtinKey] = line.reps;
  }
  return values;
}

export async function saveCalendarDayAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const up = user.userPrograms[0];
  if (!up) throw new Error("Program not started");

  const dayKey = String(formData.get("dayKey") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  assertDayKey(dayKey);
  assertStatus(statusRaw);

  if (
    statusRaw !== "NONE" &&
    !isCalendarDayEditable({
      dayKey,
      startedAt: up.startedAt,
      registeredAt: user.createdAt,
      durationDays: up.program.durationDays,
      cursorDay: up.cursorDay,
    })
  ) {
    throw new Error("Day is locked");
  }

  if (statusRaw === "NONE") {
    await prisma.userCalendarDay.deleteMany({
      where: { userId: user.id, dayKey },
    });
    await prisma.trainingDayEntry.deleteMany({
      where: { userId: user.id, dayKey },
    });
  } else {
    await prisma.userCalendarDay.upsert({
      where: { userId_dayKey: { userId: user.id, dayKey } },
      create: { userId: user.id, dayKey, status: statusRaw },
      update: { status: statusRaw },
    });

    if (statusRaw === "TRAINING") {
      const modeRaw = String(formData.get("mode") ?? "ROUNDS");
      assertTrainingMode(modeRaw);
      const rounds = parseIntField(formData, "rounds", { min: 1, max: 50 });
      const notes = String(formData.get("notes") ?? "").trim() || null;
      const parsedLines = parseExerciseLines(formData);
      if (rounds == null || !parsedLines.length) {
        throw new Error("Fill rounds and reps for all exercises");
      }

      const exercises = await listUserExercises(user.id);
      const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
      const resolvedLines: Array<{ exerciseId: string; reps: number }> = [];

      for (const line of parsedLines) {
        if (line.isNew) {
          const created = await prisma.userExercise.create({
            data: {
              userId: user.id,
              label: line.label!.slice(0, 80),
              short: line.short!.slice(0, 6),
              maxReps: line.maxReps != null ? Math.max(1, Math.min(5000, line.maxReps)) : 5000,
              sortOrder: exercises.length + resolvedLines.filter((row) => !byId.has(row.exerciseId)).length,
            },
            select: { id: true },
          });
          resolvedLines.push({ exerciseId: created.id, reps: line.reps });
          continue;
        }

        const exercise = byId.get(line.exerciseId);
        if (!exercise) throw new Error("Exercise not found");
        const maxReps = exercise.maxReps;
        if (line.reps > maxReps) throw new Error("Reps exceed exercise maximum");
        resolvedLines.push({ exerciseId: line.exerciseId, reps: line.reps });
      }

      const legacyReps = legacyRepsFromLines(resolvedLines, exercises);
      const entry = await prisma.trainingDayEntry.upsert({
        where: { userId_dayKey: { userId: user.id, dayKey } },
        create: {
          userId: user.id,
          dayKey,
          mode: modeRaw,
          rounds,
          pullupsReps: legacyReps.pullupsReps,
          squatsReps: legacyReps.squatsReps,
          pushupsReps: legacyReps.pushupsReps,
          lungesReps: legacyReps.lungesReps,
          notes,
        },
        update: {
          mode: modeRaw,
          rounds,
          pullupsReps: legacyReps.pullupsReps,
          squatsReps: legacyReps.squatsReps,
          pushupsReps: legacyReps.pushupsReps,
          lungesReps: legacyReps.lungesReps,
          notes,
        },
        select: { id: true },
      });

      await prisma.trainingDayExerciseLine.deleteMany({
        where: { trainingDayEntryId: entry.id },
      });
      await prisma.trainingDayExerciseLine.createMany({
        data: resolvedLines.map((line, index) => ({
          trainingDayEntryId: entry.id,
          userExerciseId: line.exerciseId,
          reps: line.reps,
          sortOrder: index,
        })),
      });

      const profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: {
          pullupsMax: true,
          squatsMax: true,
          pushupsMax: true,
          lungesMax: true,
        },
      });
      const merged = maxTrainingReps(trainingRepsFromProfile(profile), legacyReps);
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          pullupsMax: merged.pullupsReps,
          squatsMax: merged.squatsReps,
          pushupsMax: merged.pushupsReps,
          lungesMax: merged.lungesReps,
        },
        update: {
          pullupsMax: merged.pullupsReps,
          squatsMax: merged.squatsReps,
          pushupsMax: merged.pushupsReps,
          lungesMax: merged.lungesReps,
        },
      });
    } else {
      await prisma.trainingDayEntry.deleteMany({
        where: { userId: user.id, dayKey },
      });
    }
  }

  revalidatePath("/app/calendar");
  revalidatePath("/app/settings");
}
