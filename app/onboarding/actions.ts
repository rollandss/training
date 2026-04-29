"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type OnboardingState = { error: string } | undefined;

const schema = z.object({
  levelSelfAssessment: z.string().trim().min(1, "Оберіть або опишіть рівень"),
  limitations: z.string().trim().optional(),
  tourConfirmed: z.literal("on").optional(),
});

export async function onboardingAction(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const parsed = schema.safeParse({
    levelSelfAssessment: formData.get("levelSelfAssessment"),
    limitations: formData.get("limitations") ?? "",
    tourConfirmed: formData.get("tourConfirmed"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Помилка валідації" };
  }
  if (parsed.data.tourConfirmed !== "on") {
    return { error: "Підтвердіть наявність турніка" };
  }

  const program = await prisma.program.findUnique({ where: { slug: "100-dniv" } });
  if (!program) {
    return { error: "Програма ще не завантажена. Запустіть seed." };
  }

  await prisma.userProfile.update({
    where: { userId: user.id },
    data: {
      levelSelfAssessment: parsed.data.levelSelfAssessment,
      limitations: parsed.data.limitations || null,
      onboardingDone: true,
    },
  });

  await prisma.userProgram.upsert({
    where: {
      userId_programId: { userId: user.id, programId: program.id },
    },
    create: { userId: user.id, programId: program.id, cursorDay: 1 },
    update: { cursorDay: 1 },
  });

  redirect("/app");
}
