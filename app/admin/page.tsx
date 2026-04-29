import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Адмінка</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Контент</CardTitle>
          <CardDescription>Створення і редагування щоденних інфопостів.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/admin/posts" className={cn(buttonVariants())}>
            Пости
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
