import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PostCover } from "@/components/post-cover";
import { PostBody } from "@/components/post-body";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getPostByDayCached, getPostBySlugCached } from "@/lib/post-cache";
import { getPostBlockLabel } from "@/lib/posts";
import { todayKey as getTodayKey, unlockedProgramDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function PostDetailsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];
  const { slug } = await params;

  const post = await getPostBySlugCached(slug);
  if (!post) notFound();
  const unlockedDay = unlockedProgramDay({
    cursorDay: up.cursorDay,
    startedAt: up.startedAt,
    durationDays: up.program.durationDays,
  });
  if (post.dayNumber !== null && post.dayNumber > unlockedDay) redirect("/app/posts");

  const prev = post.dayNumber && post.dayNumber > 1 ? await getPostByDayCached(post.dayNumber - 1) : null;
  const next = post.dayNumber && post.dayNumber < unlockedDay ? await getPostByDayCached(post.dayNumber + 1) : null;
  const title = post.titleUk.replace(/^День\s+\d+\.\s*/i, "").replace(/^\d+\.\s*/, "");

  const kicker = post.dayNumber ? getPostBlockLabel(post.block) : "Перед стартом";

  return (
    <article data-surface="notebook" className="mx-auto max-w-[56rem]">
      <Link
        href="/app/posts"
        className="text-sm font-bold underline decoration-2 underline-offset-4 hover:no-underline"
        style={{ textDecorationColor: "var(--nb-margin)" }}
      >
        ← Усі пости
      </Link>

      <div className="mt-8 md:grid md:grid-cols-[7rem_minmax(0,68ch)]">
        <aside className="mb-3 flex items-baseline gap-2 md:mb-0 md:block md:pr-6 md:text-right" aria-label="День програми">
          {post.dayNumber ? (
            <>
              <span className="text-sm font-bold md:block">День</span>
              <span className="font-display text-3xl font-black leading-none md:text-5xl" style={{ color: "var(--nb-margin)" }}>
                {post.dayNumber}
              </span>
            </>
          ) : null}
        </aside>

        <div className="nb-margin-line pl-5 sm:pl-8">
          <p className="text-sm font-bold" style={{ color: "var(--nb-ink-soft)" }}>
            {kicker}
          </p>
          <h1 className="font-display mt-1 text-[clamp(1.75rem,4.5vw,2.5rem)] font-black leading-[1.12] tracking-[-0.015em]">
            {title}
          </h1>

          {post.imageUrl ? (
            <figure className="mt-7 aspect-[16/9] w-full overflow-hidden border-2 has-[[data-cover-failed]]:hidden" style={{ borderColor: "var(--nb-ink)" }}>
              <PostCover src={post.imageUrl} alt="" hideOnError />
            </figure>
          ) : null}

          <PostBody body={post.bodyUk} className="mt-7" />

          <footer className="mt-14 flex flex-col gap-5 border-t-2 border-dashed pt-7 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--nb-ink-soft)" }}>
            {post.dayNumber === unlockedDay ? (
              <Link href={`/app/calendar?open=${getTodayKey()}`} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}>
                Відмітити сьогодні
              </Link>
            ) : (
              <span />
            )}
            <nav className="flex gap-6 text-sm font-bold" aria-label="Сусідні дні">
              {prev ? (
                <Link href={`/app/post/${prev.slug}`} className="underline decoration-2 underline-offset-4 hover:no-underline" style={{ textDecorationColor: "var(--nb-margin)" }}>
                  ← День {prev.dayNumber}
                </Link>
              ) : null}
              {next ? (
                <Link href={`/app/post/${next.slug}`} className="underline decoration-2 underline-offset-4 hover:no-underline" style={{ textDecorationColor: "var(--nb-margin)" }}>
                  День {next.dayNumber} →
                </Link>
              ) : null}
            </nav>
          </footer>
        </div>
      </div>
    </article>
  );
}
