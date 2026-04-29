import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, getPostBlockSlug } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function PostsPage() {
  const user = await getCurrentUser();
  if (!user?.userPrograms[0]) redirect("/auth/login");
  const up = user.userPrograms[0];

  const posts = await prisma.dailyPost.findMany({
    orderBy: [{ dayNumber: "asc" }, { createdAt: "asc" }],
  });

  const cursorDay = Math.min(up.cursorDay, 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Пости програми</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Блоки відкриваються поступово. Доступ до постів всередині блоку залежить від поточного дня.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POST_BLOCK_ORDER.map((block) => {
          const inBlock = posts.filter((post) => post.block === block);
          if (inBlock.length === 0) return null;
          const unlocked = inBlock.filter((post) => post.dayNumber === null || post.dayNumber <= cursorDay).length;
          return (
            <Card key={block}>
              <CardHeader>
                <CardTitle>{POST_BLOCK_LABELS[block]}</CardTitle>
                <CardDescription>
                  Доступно {unlocked} з {inBlock.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/app/posts/block/${getPostBlockSlug(block)}`}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Відкрити блок
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
