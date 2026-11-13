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

  return (
    <article className="mx-auto max-w-[68ch]">
      <Link href="/app/posts" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:no-underline">
        Усі пости
      </Link>
      <p className="mt-8 text-base font-bold">
        {post.dayNumber ? `День ${post.dayNumber}, ${getPostBlockLabel(post.block).toLowerCase()} блок` : "Перед стартом"}
      </p>
      <h1 className="font-display mt-2 text-[clamp(2rem,5.5vw,3rem)] font-black leading-[1.05] tracking-[-0.02em]">{title}</h1>
      {post.imageUrl ? (
        <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)] border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)] has-[[data-cover-failed]]:hidden">
          <PostCover src={post.imageUrl} alt="" hideOnError />
        </div>
      ) : null}
      <div className="mt-8 rounded-[var(--radius)] border-4 border-border bg-card px-5 py-6 sm:px-8 sm:py-8">
        <PostBody body={post.bodyUk} />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {post.dayNumber === unlockedDay ? (
          <Link href={`/app/calendar?open=${getTodayKey()}`} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}>
            Відмітити сьогодні
          </Link>
        ) : (
          <span />
        )}
        <nav className="flex gap-5 text-sm font-bold" aria-label="Сусідні дні">
          {prev ? (
            <Link href={`/app/post/${prev.slug}`} className="underline decoration-2 underline-offset-4 hover:no-underline">
              ← День {prev.dayNumber}
            </Link>
          ) : null}
          {next ? (
            <Link href={`/app/post/${next.slug}`} className="underline decoration-2 underline-offset-4 hover:no-underline">
              День {next.dayNumber} →
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}
