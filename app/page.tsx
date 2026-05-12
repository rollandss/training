import Link from "next/link";

import { SiteLogo } from "@/components/site-logo";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-4 border-border bg-card/90 shadow-[0_6px_0px_0px_var(--color-border)]">
        <div className="mx-auto w-full max-w-[1400px] px-3 py-3 md:px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div />
            <SiteLogo href="/" centered markClassName="h-9 w-auto" />
            <div className="flex items-center justify-end gap-2">
            <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Увійти
            </Link>
            <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }))}>
              Почати
            </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full flex-1 flex-col gap-8 px-3 py-12 md:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="space-y-4 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">Українською</Badge>
                <Badge variant="secondary">100 днів</Badge>
                <Badge variant="secondary">Турнік обовʼязково</Badge>
                <Badge variant="secondary">Безкоштовно</Badge>
              </div>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
                Стоденка: 100 днів, які затягують
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                Щодня відкриваєш короткий інфопост: що робити сьогодні, як прогресувати, як не злитись на 7‑й день і чому
                відпочинок — частина плану. Це не “марафон мотивації”, а структурована програма.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }))}>
                  Почати 100 днів
                </Link>
                <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  Увійти
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                <span className="rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
                  Пост на день
                </span>
                <span className="rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
                  Фази + відновлення
                </span>
                <span className="rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
                  Для новачків
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-lg">Що потрібно</CardTitle>
              <CardDescription>Мінімум обладнання. Максимум користі.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm font-medium text-muted-foreground">
                <p>
                  - <span className="font-black text-foreground">Турнік</span> (дверний/вуличний)
                </p>
                <p>
                  - <span className="font-black text-foreground">10–20 хв</span> на день
                </p>
                <p>
                  - <span className="font-black text-foreground">Сон і вода</span> (без фанатизму)
                </p>
              </div>

              <div className="rounded-[var(--radius)] border-4 border-border bg-background p-4 shadow-[8px_8px_0px_0px_var(--color-border)]">
                <p className="text-sm font-black uppercase tracking-wider">Підходить, якщо:</p>
                <ul className="mt-2 space-y-1 text-sm font-medium text-muted-foreground">
                  <li>- давно хотів “почати з понеділка”, але без хаосу</li>
                  <li>- хочеш відчутний прогрес без тренажерки</li>
                  <li>- любиш чіткий план, а не випадкові тренування</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Як це працює</CardTitle>
            <CardDescription>Супер простий ритм на 100 днів.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm font-medium text-muted-foreground">
            <p>
              <span className="font-black text-foreground">1.</span> Реєструєшся — дні відкриваються послідовно.
            </p>
            <p>
              <span className="font-black text-foreground">2.</span> Читаєш “пост дня” — робиш рівно те, що треба.
            </p>
            <p>
              <span className="font-black text-foreground">3.</span> Повторюєш завтра. Пропустив — повернувся, без драм.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Готовий почати?</CardTitle>
            <CardDescription>Створи акаунт і відкрий перший день.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }))}>
              Почати зараз
            </Link>
            <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Я вже маю акаунт
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
