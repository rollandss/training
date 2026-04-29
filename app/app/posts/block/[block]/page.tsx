import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getPostBlockLabel, parsePostBlockSlug } from "@/lib/posts";
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

  const posts = await prisma.dailyPost.findMany({
    where: { block },
    orderBy: [{ dayNumber: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{getPostBlockLabel(block)}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            У блоці {posts.length} пост(ів). Закриті пости відкриються у відповідний день.
          </p>
        </div>
        <Link href="/app/posts" className={cn(buttonVariants({ variant: "outline" }))}>
          До блоків
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post) => {
          const locked = post.dayNumber !== null && post.dayNumber > up.cursorDay;
          return (
            <div key={post.id} className="overflow-hidden rounded-lg border bg-card">
              <div className="relative h-32 w-full bg-muted">
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt={post.titleUk} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                    Фото посту
                  </div>
                )}
                {locked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="rounded-full bg-white/90 p-3">
                      <Lock className="size-6 text-zinc-700" />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2 p-3 text-sm">
                <div className="flex items-center gap-2">
                  {post.dayNumber ? <Badge variant="outline">День {post.dayNumber}</Badge> : null}
                  <Badge variant="secondary">{getPostBlockLabel(post.block)}</Badge>
                </div>
                <div className={cn("line-clamp-2 font-medium", locked && "text-muted-foreground")}>{post.titleUk}</div>
                {locked ? (
                  <div className="text-muted-foreground text-xs">Пост закритий до відповідного дня</div>
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
