"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CalendarStatus = "TRAINING" | "REST" | "SICK";

function assertDayKey(dayKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    throw new Error("Invalid dayKey");
  }
}

function assertStatus(status: string): asserts status is CalendarStatus {
  if (status !== "TRAINING" && status !== "REST" && status !== "SICK") {
    throw new Error("Invalid status");
  }
}

export async function setCalendarDayStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const dayKey = String(formData.get("dayKey") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  assertDayKey(dayKey);
  assertStatus(statusRaw);

  await prisma.userCalendarDay.upsert({
    where: { userId_dayKey: { userId: user.id, dayKey } },
    create: { userId: user.id, dayKey, status: statusRaw },
    update: { status: statusRaw },
  });

  revalidatePath("/app/calendar");
}

