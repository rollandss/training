import "server-only";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      profile: true,
      userPrograms: {
        take: 1,
        orderBy: { startedAt: "desc" },
        include: { program: true },
      },
    },
  });
}
