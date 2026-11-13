import Link from "next/link";
import { CalendarCheck, Check, ChevronDown, Layers, Newspaper, Sprout } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Newspaper,
    title: "Пост на день",
    text: "Короткий матеріал: що робити сьогодні і чому саме так.",
  },
  {
    icon: Layers,
    title: "Фази + відновлення",
    text: "Підготовка → базовий → просунутий → турбо. Відпочинок — частина плану.",
  },
  {
    icon: Sprout,
    title: "Для новачків",
    text: "Не вмієш підтягуватись? Почнемо з полегшених варіантів.",
  },
] as const;

const NEEDS = [
  { strong: "Турнік", rest: "дверний або вуличний" },
  { strong: "10–20 хв", rest: "на день" },
  { strong: "Сон і вода", rest: "без фанатизму" },
] as const;

const FITS = [
  "давно хотів «почати з понеділка», але без хаосу",
  "хочеш відчутний прогрес без тренажерки",
  "любиш чіткий план, а не випадкові тренування",
] as const;

const FAQ = [
  {
    q: "Я не можу підтягнутися жодного разу. Мені підходить?",
    a: "Так. Програма стартує з полегшених варіантів — австралійські та негативні підтягування — і поступово веде до повних.",
  },
  {
    q: "Що буде, якщо я пропущу день?",
    a: "Нічого страшного. Дні відкриваються по черзі, тож просто повертаєшся і продовжуєш. У календарі можна позначити відпочинок або хворобу.",
  },
  {
    q: "Скільки це коштує?",
    a: "Безкоштовно. Потрібні лише турнік і 10–20 хвилин на день.",
  },
  {
    q: "Як відмічати тренування?",
    a: "Після входу на головній є кнопка «Відмітити сьогодні». Там же можна провести заняття з таймером відпочинку і записати повтори.",
  },
  {
    q: "А якщо в мене болять плечі, спина чи коліна?",
    a: "Перед стартом порадься з лікарем. В онбордингу можна вказати обмеження, а в постах є полегшені варіанти вправ.",
  },
] as const;

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
              <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
                Почати
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8 px-3 py-12 md:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="space-y-6 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">Українською</Badge>
                <Badge variant="secondary">100 днів</Badge>
                <Badge variant="secondary">Турнік обовʼязково</Badge>
                <Badge variant="secondary">Безкоштовно</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
                  Стоденка: 100 днів, які затягують
                </h1>
                <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
                  Щодня відкриваєш короткий інфопост: що робити сьогодні, як прогресувати, як не злитись на 7‑й день і
                  чому відпочинок — частина плану. Це не «марафон мотивації», а структурована програма.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }))}>
                  Почати 100 днів
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Вже маю акаунт
                </Link>
              </div>

              <ul className="grid gap-4 border-t-4 border-border pt-6 sm:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-3 sm:flex-col sm:gap-2">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-secondary-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-black uppercase tracking-wider">{title}</span>
                      <span className="block text-sm font-medium text-muted-foreground">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-lg">Що потрібно</CardTitle>
              <CardDescription>Мінімум обладнання. Максимум користі.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="grid gap-2 text-sm font-medium text-muted-foreground">
                {NEEDS.map((n) => (
                  <li key={n.strong} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-foreground" aria-hidden />
                    <span>
                      <span className="font-black text-foreground">{n.strong}</span> — {n.rest}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-[var(--radius)] border-4 border-border bg-primary p-4 text-primary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]">
                <p className="text-sm font-black uppercase tracking-wider">Підходить, якщо ти:</p>
                <ul className="mt-2 space-y-1.5 text-sm font-medium">
                  {FITS.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Як це працює</CardTitle>
            <CardDescription>Простий ритм на 100 днів.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-4 text-sm font-medium text-muted-foreground md:grid-cols-3">
              {[
                ["Реєструєшся", "дні відкриваються послідовно, по одному на добу."],
                ["Читаєш пост дня", "і робиш рівно те, що в ньому написано."],
                ["Відмічаєш день", "у календарі. Пропустив — повернувся, без драм."],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background text-sm font-black text-foreground">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-black text-foreground">{title}</span> — {text}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Часті питання</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-[var(--radius)] border-4 border-border bg-background open:shadow-[6px_6px_0px_0px_var(--color-border)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-black [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="px-4 pb-4 text-sm font-medium leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-1">
              <p className="text-2xl font-black uppercase tracking-wider">Готовий почати?</p>
              <p className="text-sm font-semibold opacity-80">Створи акаунт — перший день відкриється одразу.</p>
            </div>
            <Link href="/auth/register" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-background")}>
              <CalendarCheck className="size-5" aria-hidden />
              Почати зараз
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t-4 border-border bg-card/90">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-3 py-6 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p className="max-w-3xl">
            Стоденка — інформаційна програма тренувань і не замінює консультацію лікаря. Якщо маєш травми чи хронічні
            захворювання, порадься з фахівцем перед стартом і зупиняйся при болю.
          </p>
          <p className="font-bold">© {new Date().getFullYear()} Стоденка</p>
        </div>
      </footer>
    </div>
  );
}
