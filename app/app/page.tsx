import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";

import { HundredBoard, type BoardMark } from "@/components/hundred-board";
import { PostCover } from "@/components/post-cover";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { programDayFromDayKey } from "@/lib/calendar-access";
import { CALENDAR_STATUS_UI } from "@/lib/calendar-status";
import { getPostByDayCached } from "@/lib/post-cache";
import { excerptPostBody } from "@/lib/post-text";
import { getPostBlockLabel } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { calendarDate, dayKeyFromCalendarDate, todayKey as getTodayKey, unlockedProgramDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

const MARKS = new Set<BoardMark>(["TRAINING", "STRETCHING", "REST", "SICK"]);

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
  const todayKey = getTodayKey();
  const programStart = calendarDate(new Date(up.startedAt));

  const [dailyPost, days] = await Promise.all([
    getPostByDayCached(currentDay),
    prisma.userCalendarDay.findMany({
      where: { userId: user.id, dayKey: { gte: dayKeyFromCalendarDate(programStart) } },
      select: { dayKey: true, status: true },
    }),
  ]);

  const marks = new Map<number, BoardMark>();
  let todayStatus: BoardMark | undefined;
  for (const d of days) {
    const day = programDayFromDayKey(d.dayKey, up.startedAt);
    if (!day || day < 1 || day > 100 || !MARKS.has(d.status as BoardMark)) continue;
    marks.set(day, d.status as BoardMark);
    if (d.dayKey === todayKey) todayStatus = d.status as BoardMark;
  }
  const trainings = [...marks.values()].filter((m) => m === "TRAINING").length;
  const finished = currentDay >= program.durationDays;

  const dayKeyFor = (day: number) =>
    dayKeyFromCalendarDate(new Date(programStart.getTime() + (day - 1) * 86_400_000));
  const calendarHref = (day: number) => {
    const key = dayKeyFor(day);
    return `/app/calendar?m=${key.slice(0, 7)}&open=${key}`;
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <div className="min-w-0 space-y-10">
        <section aria-labelledby="today-heading">
          <p className="text-base font-bold">{dailyPost ? getPostBlockLabel(dailyPost.block) : program.name}</p>
          <h1 id="today-heading" className="font-display mt-1 text-[clamp(2.5rem,7vw,4rem)] font-black leading-[0.95] tracking-[-0.02em]">
            День {currentDay}
            <span className="text-foreground/40"> / {program.durationDays}</span>
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg font-medium">
            {finished
              ? "Програму пройдено. Протестуй максимуми і порівняй із першим днем — це твій результат."
              : marks.size === 0
                ? "Почни з посту дня, а ввечері відміть, як пройшов день."
                : `Відмічено ${marks.size} ${plural(marks.size, "день", "дні", "днів")}, із них ${trainings} ${plural(trainings, "тренування", "тренування", "тренувань")}.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={`/app/calendar?open=${todayKey}`}
              className={cn(buttonVariants({ size: "lg", variant: todayStatus ? "outline" : "default" }), "h-12 px-6 text-base")}
            >
              {todayStatus ? <CircleCheck className="size-5" aria-hidden /> : null}
              {todayStatus ? `Сьогодні: ${CALENDAR_STATUS_UI[todayStatus].label.toLowerCase()}` : "Відмітити сьогодні"}
            </Link>
            {todayStatus ? <span className="text-sm font-semibold">Можна змінити в будь-який момент</span> : null}
          </div>
        </section>

        {dailyPost ? (
          <article className="overflow-hidden rounded-[var(--radius)] border-4 border-border bg-card shadow-[10px_10px_0px_0px_var(--color-border)]">
            <div className="aspect-[16/7] w-full border-b-4 border-border">
              <PostCover src={dailyPost.imageUrl} alt="" fallbackLabel={`День ${currentDay}`} />
            </div>
            <div className="space-y-4 p-5 sm:p-7">
              <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.01em] sm:text-3xl">{dailyPost.titleUk}</h2>
              <p className="max-w-[62ch] text-base leading-relaxed text-muted-foreground">{excerptPostBody(dailyPost.bodyUk, 260)}</p>
              <Link href={`/app/post/${dailyPost.slug}`} className={cn(buttonVariants(), "h-11 px-5")}>
                Читати пост дня
              </Link>
            </div>
          </article>
        ) : (
          <div className="rounded-[var(--radius)] border-4 border-dashed border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">Пост на сьогодні ще не готовий</h2>
            <p className="mt-2 text-base text-muted-foreground">Поки що можна перечитати попередні дні в архіві.</p>
            <Link href="/app/posts" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
              Відкрити всі пости
            </Link>
          </div>
        )}
      </div>

      <aside aria-labelledby="board-heading" className="lg:pt-2">
        <h2 id="board-heading" className="font-display text-xl font-bold">
          Твоя сотня
        </h2>
        <p className="mb-5 mt-1 text-sm font-medium text-muted-foreground">Натисни на день, щоб відкрити його в календарі.</p>
        <HundredBoard marks={marks} today={currentDay} hrefForDay={calendarHref} label="Твої 100 днів" compact />
      </aside>
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
