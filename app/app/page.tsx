import Link from "next/link";
import { redirect } from "next/navigation";

import { TodayPostFeature } from "@/components/today-post-feature";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { CALENDAR_STATUS_UI } from "@/lib/calendar-status";
import { getPostByDayCached } from "@/lib/post-cache";
import { prisma } from "@/lib/prisma";
import { unlockedProgramDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default async function AppDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/onboarding");
  const up = user.userPrograms[0];
  const { program } = up;

  const currentDay = unlockedProgramDay({
    cursorDay: up.cursorDay,
    startedAt: up.startedAt,
    durationDays: program.durationDays,
  });

  if (currentDay > program.durationDays || currentDay > 100) {
    return (
      <Card className="overflow-hidden border-4 border-border shadow-[10px_10px_0px_0px_var(--color-border)]">
        <CardHeader className="space-y-2 border-b-4 border-border bg-card">
          <CardTitle className="text-3xl font-extrabold uppercase tracking-wider">Вітаємо з завершенням</CardTitle>
          <CardDescription className="text-sm font-semibold">
            Ви пройшли програму. Усі пости доступні в архіві.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Link href="/app/posts" className={cn(buttonVariants(), "w-full sm:w-auto")}>
            Відкрити всі пости
          </Link>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const todayKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
  const [dailyPost, todayMark] = await Promise.all([
    getPostByDayCached(currentDay),
    prisma.userCalendarDay.findUnique({
      where: { userId_dayKey: { userId: user.id, dayKey: todayKey } },
      select: { status: true },
    }),
  ]);
  const todayStatus = todayMark?.status as keyof typeof CALENDAR_STATUS_UI | undefined;

  return (
    <TodayPostFeature
      programName={program.name}
      currentDay={currentDay}
      durationDays={program.durationDays}
      post={dailyPost}
      todayKey={todayKey}
      todayStatusLabel={todayStatus && CALENDAR_STATUS_UI[todayStatus] ? CALENDAR_STATUS_UI[todayStatus].label : null}
    />
  );
}
