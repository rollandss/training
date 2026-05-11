"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CalendarStatus = "TRAINING" | "STRETCHING" | "REST" | "SICK";
export type CalendarStatusOrNone = CalendarStatus | "NONE";

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

export async function saveCalendarDayAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const dayKey = String(formData.get("dayKey") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  assertDayKey(dayKey);
  assertStatus(statusRaw);

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
      const rounds = parseIntField(formData, "rounds", { min: 1, max: 50 });
      const pullupsReps = parseIntField(formData, "pullupsReps", { min: 0, max: 500 });
      const squatsReps = parseIntField(formData, "squatsReps", { min: 0, max: 5000 });
      const pushupsReps = parseIntField(formData, "pushupsReps", { min: 0, max: 5000 });
      const lungesReps = parseIntField(formData, "lungesReps", { min: 0, max: 5000 });
      const notes = String(formData.get("notes") ?? "").trim() || null;

      if (rounds == null || pullupsReps == null || squatsReps == null || pushupsReps == null || lungesReps == null) {
        throw new Error("Fill rounds and reps for all exercises");
      }

      await prisma.trainingDayEntry.upsert({
        where: { userId_dayKey: { userId: user.id, dayKey } },
        create: { userId: user.id, dayKey, rounds, pullupsReps, squatsReps, pushupsReps, lungesReps, notes },
        update: { rounds, pullupsReps, squatsReps, pushupsReps, lungesReps, notes },
      });
    } else {
      // If the day is not a workout day, keep calendar mark but remove workout details.
      await prisma.trainingDayEntry.deleteMany({
        where: { userId: user.id, dayKey },
      });
    }
  }

  revalidatePath("/app/calendar");
}

