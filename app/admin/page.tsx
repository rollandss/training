import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function AdminHomePage() {
  const [users, posts] = await Promise.all([prisma.user.count(), prisma.dailyPost.count()]);

  return (
    <div className="space-y-8">
      <PageHeader title="Адмінка" description="Учасники, їхній прогрес і контент програми." />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Учасники</CardTitle>
            <CardDescription>Прогрес, ролі та відкритий день. Зараз зареєстровано: {users}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/users" className={cn(buttonVariants())}>
              Користувачі
            </Link>
            <Link href="/admin/stats" className={cn(buttonVariants({ variant: "outline" }))}>
              Статистика
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Контент</CardTitle>
            <CardDescription>Щоденні пости і підготовчий блок. Усього постів: {posts}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/posts" className={cn(buttonVariants())}>
              Усі пости
            </Link>
            <Link href="/admin/posts/new" className={cn(buttonVariants({ variant: "outline" }))}>
              Новий пост
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
