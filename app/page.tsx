import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full flex-1 flex-col gap-8 px-3 py-12 md:px-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Українською · турнік · 100 днів</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Сотка: 100 днів на турніку</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Щоденний план тренувань, журнал виконання й бібліотека вправ. Безкоштовно, з реєстрацією — щоб зберігати
            прогрес між пристроями.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/auth/register" className={cn(buttonVariants())}>
              Почати
            </Link>
            <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline" }))}>
              Увійти
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">100 днів</CardTitle>
              <CardDescription>Статична програма з фазами та днями відновлення.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Турнік</CardTitle>
              <CardDescription>Тяга, віджимання, ноги та кор — з поясненнями українською.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Журнал</CardTitle>
              <CardDescription>Відмічайте виконання чи пропуск — рухайтесь у своєму темпі.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Як це працює</CardTitle>
            <CardDescription>Три кроки після реєстрації.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Створіть акаунт і підтвердіть наявність турніка.</p>
            <p>2. Пройдіть короткий онбординг (рівень, обмеження).</p>
            <p>3. Відкривайте «сьогоднішній» день, виконуйте блок і натискайте «Завершено».</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
