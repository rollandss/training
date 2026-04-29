import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getPostBlockLabel } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AppDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) return null;
  const up = user.userPrograms[0];
  const { program } = up;

  const currentDay = Math.min(up.cursorDay, program.durationDays);

  if (up.cursorDay > program.durationDays || currentDay > 100) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Вітаємо з завершенням!</CardTitle>
          <CardDescription>Ви пройшли програму. Усі пости доступні в архіві.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/app/posts" className={cn(buttonVariants())}>
            Відкрити всі пости
          </Link>
        </CardContent>
      </Card>
    );
  }

  const dailyPost = await prisma.dailyPost.findFirst({
    where: { dayNumber: currentDay },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Інфопост дня</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {program.name} · день {currentDay} з {program.durationDays}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {dailyPost ? dailyPost.titleUk : `День ${currentDay}`}
          </CardTitle>
          <CardDescription>
            У вебі доступні лише інформаційні пости. Тренування виконується в Android застосунку.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          {dailyPost ? (
            <Link
              href={`/app/post/${dailyPost.slug}`}
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              Пост дня ({getPostBlockLabel(dailyPost.block)})
            </Link>
          ) : (
            <p className="text-muted-foreground text-sm">Пост для цього дня ще не призначений.</p>
          )}
          <Link
            href="/app/posts"
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          >
            Архів постів
          </Link>
          {dailyPost ? null : (
            <Link
              href="/app/posts"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full sm:w-auto")}
            >
              Відкрити доступні пости
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
