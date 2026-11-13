import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getPostCatalogCached } from "@/lib/post-cache";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, getPostBlockSlug } from "@/lib/posts";
import { unlockedProgramDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

const BLOCK_COLOR: Record<string, string> = {
  PREPARATION: "bg-card",
  BASIC: "bg-primary",
  ADVANCED: "bg-secondary",
  TURBO: "bg-accent",
  CONCLUSION: "bg-foreground",
};

export default async function PostsPage() {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];

  const posts = await getPostCatalogCached();
  const unlockedDay = Math.min(
    unlockedProgramDay({ cursorDay: up.cursorDay, startedAt: up.startedAt, durationDays: up.program.durationDays }),
    100,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-[clamp(2.25rem,6vw,3.25rem)] font-black leading-[1] tracking-[-0.02em]">Усі пости</h1>
      <p className="mt-3 text-lg font-medium">
        Відкрито {unlockedDay} {unlockedDay === 1 ? "день" : unlockedDay < 5 ? "дні" : "днів"} зі 100. Наступний пост — завтра.
      </p>

      <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold" aria-label="Блоки">
        {POST_BLOCK_ORDER.map((block) => (
          <a key={block} href={`#${getPostBlockSlug(block)}`} className="underline decoration-2 underline-offset-4 hover:no-underline">
            {POST_BLOCK_LABELS[block]}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {POST_BLOCK_ORDER.map((block) => {
          const inBlock = posts.filter((p) => p.block === block);
          if (inBlock.length === 0) return null;
          const open = inBlock.filter((p) => p.dayNumber === null || p.dayNumber <= unlockedDay).length;
          return (
            <section key={block} id={getPostBlockSlug(block)} className="scroll-mt-6" aria-labelledby={`h-${block}`}>
              <div className="flex items-end justify-between gap-4">
                <h2 id={`h-${block}`} className="font-display text-2xl font-bold tracking-[-0.01em]">
                  {POST_BLOCK_LABELS[block]}
                </h2>
                <p className="shrink-0 text-sm font-bold tabular-nums">
                  {open} з {inBlock.length}
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-[var(--radius)] border-2 border-border bg-card" aria-hidden>
                <div className={cn("h-full border-r-2 border-border", BLOCK_COLOR[block])} style={{ width: `${(open / inBlock.length) * 100}%` }} />
              </div>

              <ol className="mt-4 divide-y-2 divide-border/15 rounded-[var(--radius)] border-4 border-border bg-card">
                {inBlock.map((post) => {
                  const locked = post.dayNumber !== null && post.dayNumber > unlockedDay;
                  const label = post.dayNumber ? `День ${post.dayNumber}` : "До старту";
                  const title = post.titleUk.replace(/^День\s+\d+\.\s*/i, "").replace(/^\d+\.\s*/, "");
                  return (
                    <li key={post.id}>
                      {locked ? (
                        <div className="flex items-center gap-4 px-4 py-3 text-foreground/45">
                          <span className="w-20 shrink-0 text-sm font-bold tabular-nums">{label}</span>
                          <span className="min-w-0 flex-1 truncate text-base">{title}</span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
                            <Lock className="size-3.5" aria-hidden />
                            через {post.dayNumber! - unlockedDay} дн.
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={`/app/post/${post.slug}`}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 outline-none hover:bg-primary focus-visible:bg-primary",
                            post.dayNumber === unlockedDay && "bg-primary/40",
                          )}
                        >
                          <span className="w-20 shrink-0 text-sm font-bold tabular-nums">{label}</span>
                          <span className="min-w-0 flex-1 text-base font-semibold">{title}</span>
                          {post.dayNumber === unlockedDay ? (
                            <span className="shrink-0 rounded-[3px] bg-foreground px-1.5 py-0.5 text-xs font-bold text-background">
                              сьогодні
                            </span>
                          ) : null}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
