import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { trainingRepsFromProfile } from "@/lib/training-exercises";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ExerciseBaselineForm } from "./baseline-form";
import { setEmailSubscriptionEnabledAction } from "./actions";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [sub, profile] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Налаштування</CardTitle>
          <CardDescription>Сповіщення та персональні параметри.</CardDescription>
        </CardHeader>
      </Card>

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
          <CardTitle>Email-сповіщення</CardTitle>
          <CardDescription>Раз на день надсилати лист про “пост дня”.</CardDescription>
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
              <Label htmlFor="email-enabled" className="font-black uppercase tracking-wider">
                Увімкнути щоденні листи
              </Label>
            </div>
            <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
              Зберегти
            </SubmitButton>
          </form>
          <p className="text-muted-foreground text-sm font-medium">
            Листи відправляються сервером за cron-розкладом. Якщо у вас нема налаштованого SMTP — відправка буде
            вимкнена.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

