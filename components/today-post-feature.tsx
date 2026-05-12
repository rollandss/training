"use client";

import Link from "next/link";
import { CalendarDays, LibraryBig } from "lucide-react";

import { MotionReveal } from "@/components/motion-ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { excerptPostBody } from "@/lib/post-text";
import { getPostBlockLabel } from "@/lib/posts";
import { cn } from "@/lib/utils";

type TodayPost = {
  slug: string;
  titleUk: string;
  bodyUk: string;
  imageUrl: string | null;
  block: string;
};

type TodayPostFeatureProps = {
  programName: string;
  currentDay: number;
  durationDays: number;
  post: TodayPost | null;
};

export function TodayPostFeature({ programName, currentDay, durationDays, post }: TodayPostFeatureProps) {
  const progress = Math.min(100, Math.round((currentDay / durationDays) * 100));

  return (
    <div className="space-y-6">
      <MotionReveal>
        <div className="relative overflow-hidden rounded-[var(--radius)] border-4 border-border bg-card p-4 shadow-[10px_10px_0px_0px_var(--color-border)] sm:p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 size-24 rotate-12 border-4 border-border bg-primary shadow-[8px_8px_0px_0px_var(--color-border)]" />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Пост дня</p>
                <h1 className="text-3xl font-extrabold uppercase tracking-wider sm:text-4xl">День {currentDay}</h1>
                <p className="text-sm font-semibold text-muted-foreground">
                  {programName} · {currentDay} з {durationDays}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="border-4 border-border px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)]"
              >
                {progress}%
              </Badge>
            </div>
            <div className="h-3 overflow-hidden rounded-[var(--radius)] border-4 border-border bg-background shadow-[4px_4px_0px_0px_var(--color-border)]">
              <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </MotionReveal>

      {post ? (
        <MotionReveal delay={0.06}>
          <Link
            href={`/app/post/${post.slug}`}
            className="group block overflow-hidden rounded-[var(--radius)] border-4 border-border bg-card shadow-[10px_10px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[12px_12px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="relative aspect-[16/9] w-full border-b-4 border-border bg-muted sm:aspect-[21/9]">
              {post.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt={post.titleUk} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Матеріал дня без обкладинки
                </div>
              )}
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{getPostBlockLabel(post.block)}</Badge>
                <Badge variant="outline">День {currentDay}</Badge>
              </div>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{post.titleUk}</h2>
              <p className="text-sm font-medium leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {excerptPostBody(post.bodyUk)}
              </p>
              <span
                className={cn(
                  buttonVariants(),
                  "inline-flex w-full justify-center sm:w-auto",
                  "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_var(--color-border)]",
                )}
              >
                Читати повністю
              </span>
            </div>
          </Link>
        </MotionReveal>
      ) : (
        <MotionReveal delay={0.06}>
          <div className="rounded-[var(--radius)] border-4 border-dashed border-border bg-muted/30 p-5 shadow-[8px_8px_0px_0px_var(--color-border)]">
            <h2 className="text-xl font-black uppercase tracking-wider">Пост ще не готовий</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Для дня {currentDay} поки немає опублікованого матеріалу. Перегляньте вже доступні пости в архіві.
            </p>
            <Link href="/app/posts" className={cn(buttonVariants(), "mt-4 inline-flex w-full sm:w-auto")}>
              Відкрити архів
            </Link>
          </div>
        </MotionReveal>
      )}

      <MotionReveal delay={0.1}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/app/calendar"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto min-h-14 justify-start gap-3 px-4 py-3 text-left font-black uppercase tracking-wider",
            )}
          >
            <CalendarDays className="size-5 shrink-0" />
            <span className="space-y-0.5">
              <span className="block text-sm">Календар</span>
              <span className="block text-xs font-semibold normal-case tracking-normal text-muted-foreground">
                Познач день і проведи тренування
              </span>
            </span>
          </Link>
          <Link
            href="/app/posts"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto min-h-14 justify-start gap-3 px-4 py-3 text-left font-black uppercase tracking-wider",
            )}
          >
            <LibraryBig className="size-5 shrink-0" />
            <span className="space-y-0.5">
              <span className="block text-sm">Архів постів</span>
              <span className="block text-xs font-semibold normal-case tracking-normal text-muted-foreground">
                Усі блоки програми в одному місці
              </span>
            </span>
          </Link>
        </div>
      </MotionReveal>
    </div>
  );
}
