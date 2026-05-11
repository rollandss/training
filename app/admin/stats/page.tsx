import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDayKeyUTC(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export default async function AdminStatsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/app");

  const totalUsers = await prisma.user.count();
  const totalPrograms = await prisma.userProgram.count();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const monthStartKey = toDayKeyUTC(monthStart);
  const monthEndKey = toDayKeyUTC(monthEnd);

  const monthCounts = await prisma.userCalendarDay.groupBy({
    by: ["status"],
    where: { dayKey: { gte: monthStartKey, lt: monthEndKey } },
    _count: { _all: true },
  });
  const monthMap = new Map(monthCounts.map((c) => [c.status, c._count._all]));

  const last7 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));
  const last7Key = toDayKeyUTC(last7);
  const activeLast7 = await prisma.userCalendarDay.findMany({
    where: { dayKey: { gte: last7Key } },
    select: { userId: true },
    distinct: ["userId"],
  });

  const activeLast30 = await prisma.userCalendarDay.findMany({
    where: { dayKey: { gte: toDayKeyUTC(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29))) } },
    select: { userId: true },
    distinct: ["userId"],
  });

  return (
    <div className="space-y-8">
      <div className="relative inline-flex flex-col gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-4 shadow-[10px_10px_0px_0px_var(--color-border)]">
        <div className="pointer-events-none absolute right-3 top-3 size-10 border-4 border-border bg-primary shadow-[6px_6px_0px_0px_var(--color-border)]" />
        <h1 className="text-3xl font-extrabold uppercase tracking-wider">Статистика</h1>
        <p className="text-muted-foreground text-sm font-semibold">Загальні метрики і активність через календарні позначки.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Учасники</CardTitle>
            <CardDescription>Усього зареєстровано</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-black">{totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Стартували програму</CardTitle>
            <CardDescription>Записи `UserProgram`</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-black">{totalPrograms}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Активні</CardTitle>
            <CardDescription>Є позначки в календарі</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">7д: {activeLast7.length}</Badge>
            <Badge variant="secondary">30д: {activeLast30.length}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Позначки за місяць</CardTitle>
          <CardDescription>
            Діапазон: <span className="font-mono text-xs">{monthStartKey}</span> …{" "}
            <span className="font-mono text-xs">{monthEndKey}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge className="bg-primary text-primary-foreground">TRAINING: {monthMap.get("TRAINING") ?? 0}</Badge>
          <Badge className="bg-accent text-accent-foreground">STRETCHING: {monthMap.get("STRETCHING") ?? 0}</Badge>
          <Badge variant="secondary">REST: {monthMap.get("REST") ?? 0}</Badge>
          <Badge variant="outline">SICK: {monthMap.get("SICK") ?? 0}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

