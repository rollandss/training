import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getPostBlockLabel } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { unlockedProgramDayByTime } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export default async function PostDetailsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];
  const { slug } = await params;

  const post = await prisma.dailyPost.findUnique({ where: { slug } });
  if (!post) notFound();
  const unlockedDay = unlockedProgramDayByTime({ startedAt: up.startedAt, durationDays: up.program.durationDays });
  if (post.dayNumber !== null && post.dayNumber > unlockedDay) redirect("/app/posts");

  return (
    <div className="space-y-5">
      <Link href="/app/posts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}>
        ← До постів
      </Link>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {getPostBlockLabel(post.block)}
            </Badge>
            {post.dayNumber ? <Badge variant="outline">День {post.dayNumber}</Badge> : null}
          </div>
          <CardTitle className="text-2xl">{post.titleUk}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.imageUrl ? (
            <div className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt={post.titleUk} className="h-auto max-h-[420px] w-full object-cover" />
            </div>
          ) : null}
          <article className="text-sm leading-relaxed whitespace-pre-wrap">{post.bodyUk}</article>
        </CardContent>
      </Card>
    </div>
  );
}
