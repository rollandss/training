import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { canSendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

import { trainingRepsFromProfile } from "@/lib/training-exercises";
import { listUserExercises } from "@/lib/user-exercises";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ExerciseBaselineForm } from "./baseline-form";
import { UserExercisesForm } from "./user-exercises-form";
import { setEmailSubscriptionEnabledAction } from "./actions";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const emailReady = canSendEmail();
  const [sub, profile, exercises] = await Promise.all([
    prisma.userEmailSubscription.findUnique({
      where: { userId: user.id },
      select: { enabled: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: {
        pullupsMax: true,
        squatsMax: true,
        pushupsMax: true,
        lungesMax: true,
      },
    }),
    listUserExercises(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,3.25rem)] font-black leading-[1] tracking-[-0.02em]">Налаштування</h1>
        <p className="mt-3 text-base font-medium">Твої максимуми, вправи для тренувань і пошта.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Стартові максимуми</CardTitle>
          <CardDescription>
            Ці цифри з підготовчих постів стають стартовими повтореннями в календарі. Після кожного збереженого
            тренування вони оновлюються, якщо ви зробили більше.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExerciseBaselineForm initial={trainingRepsFromProfile(profile)} />
          <Link href="/app/posts/block/preparation" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Підготовчі пости про тест максимумів
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Мої вправи</CardTitle>
          <CardDescription>
            Увімкни вправи для тренування, змінюй порядок і додавай свої: повтори або час (наприклад планка).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserExercisesForm
            key={exercises.map((exercise) => `${exercise.id}:${exercise.enabled}`).join("-")}
            initial={exercises}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email-сповіщення</CardTitle>
          <CardDescription>Раз на день — лист із постом дня.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={setEmailSubscriptionEnabledAction} className="grid gap-3">
            <div className="flex items-center gap-3">
              <input
                id="email-enabled"
                name="enabled"
                type="checkbox"
                defaultChecked={sub?.enabled ?? false}
                className="size-5 accent-black"
              />
              <Label htmlFor="email-enabled" className="font-black">
                Увімкнути щоденні листи
              </Label>
            </div>
            <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
              Зберегти
            </SubmitButton>
          </form>
          <p className="text-muted-foreground text-sm font-medium">
            Лист із постом дня приходить щоранку на <span className="break-all font-bold text-foreground">{user.email}</span>. Якщо
            сьогоднішній день ще не відкрився або пост не опубліковано — листа не буде.
          </p>
          {!emailReady ? (
            <p className="rounded-[var(--radius)] border-4 border-dashed border-border bg-background p-3 text-sm font-medium">
              Розсилка ще не запущена. Можете ввімкнути зараз — листи почнуть приходити, щойно її налаштують.
            </p>
          ) : null}
          {user.role === "ADMIN" && !emailReady ? (
            <p className="text-xs font-medium text-muted-foreground">
              Для адміна: задайте у Vercel <code className="font-mono">SMTP_HOST</code>, <code className="font-mono">SMTP_USER</code>,{" "}
              <code className="font-mono">SMTP_PASS</code>, <code className="font-mono">EMAIL_FROM</code> (і за потреби{" "}
              <code className="font-mono">SMTP_PORT</code>). Cron щодня о 07:00 UTC.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

