import { PageHeader } from "@/components/page-header";
import { DAY_FORMS, pluralUk } from "@/lib/plural";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getPostCatalogCached } from "@/lib/post-cache";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, getPostBlockSlug } from "@/lib/posts";
import { unlockedProgramDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

const BLOCK_COLOR: Record<string, string> = {
  PREPARATION: "bg-[var(--nb-ink-soft)]",
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
    <div data-surface="notebook" className="mx-auto max-w-3xl">
      <PageHeader
        title="Усі пости"
        description={`Відкрито ${unlockedDay} ${pluralUk(unlockedDay, DAY_FORMS)} зі 100. Наступний пост — завтра.`}
      />

      <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold" aria-label="Блоки">
        {POST_BLOCK_ORDER.map((block) => (
          <a key={block} href={`#${getPostBlockSlug(block)}`} className="underline decoration-2 underline-offset-4 hover:no-underline" style={{ textDecorationColor: "var(--nb-margin)" }}>
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
              <div className="mt-3 h-2 overflow-hidden border border-current/40" aria-hidden>
                <div className={cn("h-full", BLOCK_COLOR[block])} style={{ width: `${(open / inBlock.length) * 100}%` }} />
              </div>

              <ol className="nb-margin-line mt-4 divide-y divide-dashed divide-current/25">
                {inBlock.map((post) => {
                  const locked = post.dayNumber !== null && post.dayNumber > unlockedDay;
                  const label = post.dayNumber ? `День ${post.dayNumber}` : "До старту";
                  const title = post.titleUk.replace(/^День\s+\d+\.\s*/i, "").replace(/^\d+\.\s*/, "");
                  return (
                    <li key={post.id}>
                      {locked ? (
                        <div className="flex items-center gap-4 px-4 py-3 opacity-45">
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
                            "flex items-center gap-4 px-4 py-3 outline-none hover:bg-primary/40 focus-visible:bg-primary/40",
                            post.dayNumber === unlockedDay && "bg-primary/30",
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
