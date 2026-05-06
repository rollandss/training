import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlocksTabs } from "@/components/blocks-tabs";
import { getCurrentUser } from "@/lib/auth";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, getPostBlockSlug } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { unlockedProgramDayByTime } from "@/lib/progress";
import { cn } from "@/lib/utils";

export default async function PostsPage() {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];

  const posts = await prisma.dailyPost.findMany({
    orderBy: [{ dayNumber: "asc" }, { createdAt: "asc" }],
  });

  const unlockedDay = Math.min(unlockedProgramDayByTime({ startedAt: up.startedAt, durationDays: up.program.durationDays }), 100);

  return (
    <div className="space-y-8">
      <div className="relative inline-flex w-full flex-col gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-4 shadow-[10px_10px_0px_0px_var(--color-border)]">
        <div className="pointer-events-none absolute right-3 top-3 size-10 border-4 border-border bg-secondary shadow-[6px_6px_0px_0px_var(--color-border)]" />
        <h1 className="text-3xl font-extrabold uppercase tracking-wider">Пости програми</h1>
        <p className="text-muted-foreground text-sm font-semibold">
          Відкрито до дня <span className="text-foreground font-black">{unlockedDay}</span>. Далі — по одному посту щодня.
        </p>
      </div>

      <BlocksTabs active="ALL" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {POST_BLOCK_ORDER.map((block) => {
          const inBlock = posts.filter((post) => post.block === block);
          if (inBlock.length === 0) return null;
          const unlocked = inBlock.filter((post) => post.dayNumber === null || post.dayNumber <= unlockedDay).length;
          const locked = unlocked === 0;
          return (
            <Card
              key={block}
              className={cn(
                "relative overflow-hidden",
                locked && "bg-muted/40 text-muted-foreground",
              )}
            >
              <CardHeader>
                <CardTitle className="text-xl">{POST_BLOCK_LABELS[block]}</CardTitle>
                <CardDescription>
                  Доступно {unlocked} з {inBlock.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locked ? (
                  <div className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)]">
                    <Lock className="size-4" />
                    Закрито
                  </div>
                ) : (
                  <Link
                    href={`/app/posts/block/${getPostBlockSlug(block)}`}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    Відкрити блок
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
