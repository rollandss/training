import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Panel } from "@/components/ui/panel";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader title="Налаштування" description="Твої максимуми, вправи для тренувань і пошта." />

      <Card>
        <CardHeader>
          <CardTitle>Стартові максимуми</CardTitle>
          <CardDescription>
            З них календар рахує стартові повторення. Після кожного тренування цифри оновлюються, якщо ти зробив
            більше.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExerciseBaselineForm
            initial={trainingRepsFromProfile(profile)}
            footer={
              <Link href="/app/posts/block/preparation" className={cn(buttonVariants({ variant: "outline" }))}>
                Як тестувати максимуми
              </Link>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Мої вправи</CardTitle>
          <CardDescription>
            Обирай, які вправи входять у тренування, міняй порядок і додавай свої — на повтори або на час.
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
            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-bold">
              <Checkbox name="enabled" value="on" defaultChecked={sub?.enabled ?? false} />
              Увімкнути щоденні листи
            </label>
            <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
              Зберегти
            </SubmitButton>
          </form>
          <p className="text-muted-foreground text-sm font-medium">
            Лист із постом дня приходить щоранку на <span className="break-all font-bold text-foreground">{user.email}</span>. Якщо
            сьогоднішній день ще не відкрився або пост не опубліковано — листа не буде.
          </p>
          {!emailReady ? (
            <Panel tone="dashed" className="text-sm font-medium">
              Розсилка ще не запущена. Можеш увімкнути зараз — листи почнуть приходити, щойно її налаштують.
            </Panel>
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

