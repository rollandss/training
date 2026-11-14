import { redirect } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { StatusCounts } from "@/components/status-counts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calendarDate } from "@/lib/progress";

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

  const now = calendarDate(new Date()); // wall-clock date in APP_TIMEZONE
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const monthStartKey = toDayKeyUTC(monthStart);
  const monthLabel = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(monthStart)
    .replace(/\s*р\.$/, "");
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

  const metrics = [
    { label: "Зареєстровано", value: totalUsers },
    { label: "Розпочали програму", value: totalPrograms },
    { label: "Активні за 7 днів", value: activeLast7.length },
    { label: "Активні за 30 днів", value: activeLast30.length },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Статистика" description="Скільки людей у програмі і як часто вони відмічають дні в календарі." />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent>
              <div className="text-sm font-bold">{m.label}</div>
              <div className="font-display mt-2 text-4xl font-black tabular-nums">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="first-letter:uppercase">Позначки: {monthLabel}</CardTitle>
          <CardDescription>Усі позначки всіх учасників за поточний місяць.</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusCounts counts={monthMap} />
        </CardContent>
      </Card>
    </div>
  );
}
