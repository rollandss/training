import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getPostBlockLabel } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { unlockedProgramDay } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function PostDetailsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];
  const { slug } = await params;

  const post = await prisma.dailyPost.findUnique({ where: { slug } });
  if (!post) notFound();
  const unlockedDay = unlockedProgramDay({
    cursorDay: up.cursorDay,
    startedAt: up.startedAt,
    durationDays: up.program.durationDays,
  });
  if (post.dayNumber !== null && post.dayNumber > unlockedDay) redirect("/app/posts");

  return (
    <div className="space-y-5">
      <Link href="/app/posts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}>
        ← До постів
      </Link>
      <div className="mx-auto w-full max-w-[78ch]">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{getPostBlockLabel(post.block)}</Badge>
              {post.dayNumber ? <Badge variant="outline">День {post.dayNumber}</Badge> : null}
            </div>
            <CardTitle className="text-3xl font-black leading-tight md:text-4xl">{post.titleUk}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {post.imageUrl ? (
              <div className="overflow-hidden rounded-[var(--radius)] border-4 border-border shadow-[10px_10px_0px_0px_var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt={post.titleUk} className="h-auto max-h-[520px] w-full object-cover" />
              </div>
            ) : null}
            <article className="whitespace-pre-wrap text-base leading-7 text-foreground/95 md:text-lg md:leading-8">
              {post.bodyUk}
            </article>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
