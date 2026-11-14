import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { listUserExercises } from "@/lib/user-exercises";
import { cn } from "@/lib/utils";

import { UserExercisesForm } from "./user-exercises-form";

export const metadata = { title: "Вправи" };

export default async function ExercisesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const exercises = await listUserExercises(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Вправи"
        description="З чого складається твоє тренування: вмикай потрібні вправи, міняй порядок і додавай свої — на повтори або на час."
        actions={
          <Link href="/app/calendar" className={cn(buttonVariants({ variant: "outline" }))}>
            До календаря
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Мої вправи</CardTitle>
          <CardDescription>Зміни одразу видно у формі тренування в календарі. Записи минулих днів не змінюються.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserExercisesForm
            key={exercises.map((exercise) => `${exercise.id}:${exercise.enabled}`).join("-")}
            initial={exercises}
          />
        </CardContent>
      </Card>
    </div>
  );
}
