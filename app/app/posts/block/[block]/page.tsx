import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BlocksTabs } from "@/components/blocks-tabs";
import { getCurrentUser } from "@/lib/auth";
import { getPostBlockLabel, parsePostBlockSlug, type PostBlock } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ block: string }> };

export default async function PostsBlockPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];

  const { block: blockSlug } = await params;
  const block = parsePostBlockSlug(blockSlug);
  if (!block) notFound();
  const activeBlock = block as PostBlock;

  const posts = await prisma.dailyPost.findMany({
    where: { block },
    orderBy: [{ dayNumber: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative inline-flex flex-col gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-4 shadow-[10px_10px_0px_0px_var(--color-border)]">
          <div className="pointer-events-none absolute right-3 top-3 size-10 border-4 border-border bg-primary shadow-[6px_6px_0px_0px_var(--color-border)]" />
          <h1 className="text-3xl font-extrabold uppercase tracking-wider">{getPostBlockLabel(block)}</h1>
          <p className="text-muted-foreground text-sm font-semibold">
            У блоці {posts.length} пост(ів). Закриті — з замком, як у референсі.
          </p>
        </div>
        <Link href="/app/posts" className={cn(buttonVariants({ variant: "outline" }))}>
          ← До блоків
        </Link>
      </div>

      <BlocksTabs active={activeBlock} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => {
          const locked = post.dayNumber !== null && post.dayNumber > up.cursorDay;
          return (
            <div
              key={post.id}
              className={cn(
                "relative overflow-hidden rounded-[var(--radius)] border-4 border-border bg-card shadow-[10px_10px_0px_0px_var(--color-border)]",
                locked && "opacity-95",
              )}
            >
              <div className="relative h-36 w-full border-b-4 border-border bg-muted">
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt={post.titleUk} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs font-bold uppercase">
                    Фото посту
                  </div>
                )}
                {locked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <div className="bg-card border-4 border-border p-3 shadow-[6px_6px_0px_0px_var(--color-border)]">
                      <Lock className="size-7 text-foreground" />
                    </div>
                  </div>
                ) : null}
                {post.dayNumber ? (
                  <div className="absolute left-2 top-2">
                    <Badge variant="outline">День {post.dayNumber}</Badge>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getPostBlockLabel(post.block)}</Badge>
                </div>
                <div className={cn("line-clamp-2 font-black uppercase tracking-wide", locked && "text-muted-foreground")}>
                  {post.titleUk}
                </div>
                {locked ? (
                  <div className="text-muted-foreground text-xs font-semibold">
                    Закрито до дня {post.dayNumber}
                  </div>
                ) : (
                  <Link href={`/app/post/${post.slug}`} className={cn(buttonVariants({ size: "sm" }), "w-full")}>
                    Відкрити
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
