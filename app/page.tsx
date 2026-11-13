import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { HundredBoard } from "@/components/landing/hundred-board";
import { SiteLogo } from "@/components/site-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Proportional to the real program: days 1–49, 50–91, 92–98, 99–100.
const PHASES = [
  { name: "Базовий", days: "1–49", span: 49, className: "bg-primary", text: "Техніка підтягувань, віджимань і присідань, харчування, сон, відновлення." },
  { name: "Просунутий", days: "50–91", span: 42, className: "bg-secondary", text: "Тренування підходами, нові вправи, як скласти власну програму." },
  { name: "Турбо", days: "92–98", span: 7, className: "bg-accent", text: "Щодня — новий комплекс-виклик." },
  { name: "Фініш", days: "99–100", span: 2, className: "bg-foreground", text: "Тестуєш максимуми й порівнюєш із першим днем." },
] as const;

const CIRCUIT = [
  { reps: 1, name: "підтягування" },
  { reps: 2, name: "присідання" },
  { reps: 2, name: "віджимання від підлоги" },
  { reps: 2, name: "присідання" },
] as const;

const DAY_TYPES = [
  { label: "Тренування", className: "bg-primary" },
  { label: "Розтяжка", className: "bg-accent" },
  { label: "Відпочинок", className: "bg-secondary" },
  { label: "Хвороба", className: "bg-destructive" },
] as const;

const NEEDS = [
  { title: "Турнік", text: "Дверний удома або на найближчому майданчику." },
  { title: "10–20 хвилин", text: "На старті тренування коротке. Об'єм росте разом із тобою." },
  { title: "Сон і вода", text: "Без фанатизму, але відновлення — частина плану." },
] as const;

const FAQ = [
  {
    q: "Я не можу підтягнутися жодного разу. Мені підходить?",
    a: "Так. Програма стартує з полегшених варіантів — австралійських і негативних підтягувань — і поступово веде до повних.",
  },
  {
    q: "Що буде, якщо я пропущу день?",
    a: "Нічого страшного. Дні відкриваються по одному на добу, тож просто повертаєшся і продовжуєш. Для чесної картини в календарі є позначки «Відпочинок» і «Хвороба».",
  },
  {
    q: "Скільки це коштує?",
    a: "Нічого. Ні підписок, ні реклами. Потрібні лише турнік і трохи часу щодня.",
  },
  {
    q: "А якщо в мене болять плечі, спина чи коліна?",
    a: "Перед стартом порадься з лікарем. При будь-якому болю зупиняйся — у постах є полегшені варіанти вправ.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-8">
        <SiteLogo href="/" markClassName="h-10 w-auto sm:h-12" />
        <nav className="flex items-center gap-2" aria-label="Акаунт">
          <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Увійти
          </Link>
          <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
            Почати
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero: the 100-day board is the product in one picture. */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-6 md:px-8 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-14 lg:pb-24 lg:pt-12">
          <div className="max-w-xl">
            <h1 className="font-display text-[clamp(2.5rem,6.2vw,4.25rem)] font-black leading-[0.95] tracking-[-0.02em]">
              Сто днів.
              <br />
              Один турнік.
            </h1>
            <p className="mt-6 max-w-[34ch] text-lg font-medium leading-relaxed sm:text-xl">
              Щодня — короткий пост і тренування з вагою власного тіла. Відмічаєш день і бачиш, як заповнюється твоя сотня.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "h-14 px-7 text-base")}>
                Почати перший день
              </Link>
              <Link href="/auth/login" className="text-base font-bold underline decoration-2 underline-offset-4 hover:no-underline">
                У мене вже є акаунт
              </Link>
            </div>
            <p className="mt-6 text-sm font-semibold">Безкоштовно, українською, без тренажерного залу.</p>
          </div>

          <HundredBoard />
        </section>

        {/* What one day looks like — real content from day 1. */}
        <section className="border-y-4 border-border bg-card" aria-labelledby="day-heading">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-24">
            <div>
              <h2 id="day-heading" className="font-display text-3xl font-black leading-tight tracking-[-0.01em] sm:text-4xl">
                Так виглядає один день
              </h2>
              <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
                Зранку відкривається пост: що робити сьогодні і чому. Перший — про схему базового блоку. Ось тренування з нього:
              </p>

              <div className="mt-8 rounded-[var(--radius)] border-4 border-border bg-background p-5 shadow-[8px_8px_0px_0px_var(--color-border)] sm:p-6">
                <p className="font-display text-lg font-bold">День 1. Чотири кола без відпочинку між вправами</p>
                <ol className="mt-5 grid gap-2">
                  {CIRCUIT.map((step, i) => (
                    <li key={i} className="flex items-baseline gap-4 border-b-2 border-dashed border-border/30 pb-2 last:border-0 last:pb-0">
                      <span className="font-display w-8 shrink-0 text-right text-2xl font-black tabular-nums">{step.reps}</span>
                      <span className="text-base font-semibold">{step.name}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 text-sm font-medium text-muted-foreground">
                  Легко? Завтра додаєш ще 1–2–2–2. Так кожен знаходить свій робочий рівень — без гонки за чужими цифрами.
                </p>
              </div>
            </div>

            <div className="lg:pt-24">
              <p className="text-lg font-bold">Увечері — відмічаєш день:</p>
              <div className="mt-4 grid grid-cols-2 gap-3" aria-hidden>
                {DAY_TYPES.map((t) => (
                  <div
                    key={t.label}
                    className={cn(
                      "rounded-[var(--radius)] border-4 border-border px-4 py-4 text-sm font-black",
                      t.className,
                      t.label === "Хвороба" ? "text-background" : "text-foreground",
                    )}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
              <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground">
                Для тренування є режим із таймером відпочинку: повтори записуються, а наступного разу план підтягує твої цифри.
              </p>
            </div>
          </div>
        </section>

        {/* Phases, drawn to scale. */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 lg:py-24" aria-labelledby="phases-heading">
          <h2 id="phases-heading" className="font-display text-3xl font-black leading-tight tracking-[-0.01em] sm:text-4xl">
            Чотири етапи, в масштабі
          </h2>
          <div className="mt-8 flex h-14 overflow-hidden rounded-[var(--radius)] border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)]" aria-hidden>
            {PHASES.map((p) => (
              <div key={p.name} className={cn("border-r-4 border-border last:border-r-0", p.className)} style={{ flexGrow: p.span, flexBasis: 0 }} />
            ))}
          </div>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map((p) => (
              <li key={p.name}>
                <div className="flex items-center gap-2">
                  <span className={cn("size-4 rounded-[3px] border-2 border-border", p.className)} aria-hidden />
                  <span className="font-display text-lg font-black">{p.name}</span>
                </div>
                <p className="mt-1 text-sm font-bold">Дні {p.days}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8 lg:pb-24" aria-labelledby="needs-heading">
          <h2 id="needs-heading" className="font-display text-3xl font-black leading-tight tracking-[-0.01em] sm:text-4xl">
            Що знадобиться
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3">
            {NEEDS.map((n) => (
              <li key={n.title} className="border-t-4 border-border pt-4">
                <p className="font-display text-2xl font-black">{n.title}</p>
                <p className="mt-2 max-w-[30ch] text-base leading-relaxed">{n.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t-4 border-border bg-card" aria-labelledby="faq-heading">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:px-8 lg:grid-cols-[1fr_1.6fr] lg:py-24">
            <h2 id="faq-heading" className="font-display text-3xl font-black leading-tight tracking-[-0.01em] sm:text-4xl">
              Часті питання
            </h2>
            <div className="grid gap-3">
              {FAQ.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-[var(--radius)] border-4 border-border bg-background open:shadow-[6px_6px_0px_0px_var(--color-border)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                  </summary>
                  <p className="max-w-[62ch] px-5 pb-5 text-base leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-foreground text-background">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-8 lg:py-20">
            <p className="font-display max-w-[16ch] text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1] tracking-[-0.02em]">
              Перший день відкривається одразу.
            </p>
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ size: "lg" }), "h-14 shrink-0 px-7 text-base shadow-[6px_6px_0px_0px_var(--color-background)]")}
            >
              Почати перший день
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-background/20 px-4 py-6 text-xs md:flex-row md:justify-between md:px-8">
          <p className="max-w-3xl">
            Стоденка — інформаційна програма тренувань і не замінює консультацію лікаря. З травмами чи хронічними захворюваннями
            порадься з фахівцем перед стартом і зупиняйся при болю.
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} Стоденка</p>
        </div>
      </footer>
    </div>
  );
}
