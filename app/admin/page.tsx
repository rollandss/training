import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight">Адмінка</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Учасники</CardTitle>
          <CardDescription>Перегляд прогресу, керування ролями і курсором дня.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
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
          <CardTitle className="text-base">Контент</CardTitle>
          <CardDescription>Щоденні інфопости та окремий блок підготовки.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/admin/posts?block=preparation" className={cn(buttonVariants())}>
            Підготовка
          </Link>
          <Link href="/admin/posts" className={cn(buttonVariants({ variant: "outline" }))}>
            Усі пости
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
