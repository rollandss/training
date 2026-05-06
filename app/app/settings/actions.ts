"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

