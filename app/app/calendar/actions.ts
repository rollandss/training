"use server";

import { revalidatePath } from "next/cache";

import { isCalendarDayEditable, type TrainingVolumeMode } from "@/lib/calendar-access";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TRAINING_REPS, maxTrainingReps, trainingRepsFromProfile, type TrainingRepValues } from "@/lib/training-exercises";
import { listUserExercises, type TrainingExerciseLineInput } from "@/lib/user-exercises";

export type CalendarStatus = "TRAINING" | "STRETCHING" | "REST" | "SICK";
export type CalendarStatusOrNone = CalendarStatus | "NONE";

type ParsedExerciseLine = TrainingExerciseLineInput;

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

  return parsed.map((line) => {
    if (!line || typeof line !== "object") throw new Error("Invalid exercise lines");
    const record = line as Record<string, unknown>;
    const exerciseId = String(record.exerciseId ?? "").trim();
    const reps = Number(record.reps);
    if (!exerciseId || !Number.isFinite(reps)) throw new Error("Invalid exercise lines");
    const normalizedReps = Math.floor(reps);
    if (normalizedReps < 0 || normalizedReps > 3600) throw new Error("Invalid exercise lines");

    return {
      exerciseId,
      reps: normalizedReps,
    };
  });
}

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
      const existingEntry = await prisma.trainingDayEntry.findUnique({
        where: { userId_dayKey: { userId: user.id, dayKey } },
        select: {
          lines: {
            select: { userExerciseId: true },
          },
        },
      });
      const existingExerciseIds = new Set(
        existingEntry?.lines.map((line) => line.userExerciseId) ?? [],
      );
      const resolvedLines: Array<{ exerciseId: string; reps: number }> = [];

      for (const line of parsedLines) {
        const exercise = byId.get(line.exerciseId);
        if (!exercise) throw new Error("Exercise not found");
        if (!exercise.enabled && !existingExerciseIds.has(line.exerciseId)) {
          throw new Error("Exercise is disabled");
        }
        if (line.reps > exercise.maxReps) throw new Error("Value exceeds exercise maximum");
        if (exercise.metric === "TIME" && line.reps < 5) throw new Error("Set at least 5 seconds for timed exercises");
        if (exercise.metric === "REPS" && line.reps > 5000) throw new Error("Reps exceed exercise maximum");
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
