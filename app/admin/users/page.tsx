import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { AdminMutationForm } from "./admin-mutation-form";
import { updateUserRoleAction } from "./actions";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthRangeUTC(d = new Date()) {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  const startKey = `${start.getUTCFullYear()}-${pad2(start.getUTCMonth() + 1)}-${pad2(start.getUTCDate())}`;
  const endKey = `${end.getUTCFullYear()}-${pad2(end.getUTCMonth() + 1)}-${pad2(end.getUTCDate())}`;
  return { startKey, endKeyExclusive: endKey };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/app");

  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();

  const users = await prisma.user.findMany({
    where: q ? { email: { contains: q } } : undefined,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: { select: { onboardingDone: true } },
      userPrograms: {
        take: 1,
        orderBy: { startedAt: "desc" },
        select: {
          programId: true,
          cursorDay: true,
          startedAt: true,
          program: { select: { name: true, durationDays: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const { startKey, endKeyExclusive } = monthRangeUTC();

  const grouped = await prisma.userCalendarDay.groupBy({
    by: ["userId", "status"],
    where: {
      userId: { in: users.map((u) => u.id) },
      dayKey: { gte: startKey, lt: endKeyExclusive },
    },
    _count: { _all: true },
  });

  const lastMarked = await prisma.userCalendarDay.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) } },
    _max: { dayKey: true },
  });

  const byUser = new Map<
    string,
    {
      TRAINING: number;
      STRETCHING: number;
      REST: number;
      SICK: number;
    }
  >();
  for (const row of grouped) {
    const curr = byUser.get(row.userId) ?? { TRAINING: 0, STRETCHING: 0, REST: 0, SICK: 0 };
    const status = row.status as "TRAINING" | "STRETCHING" | "REST" | "SICK";
    curr[status] = row._count._all;
    byUser.set(row.userId, curr);
  }

  const lastByUser = new Map(lastMarked.map((r) => [r.userId, r._max.dayKey ?? null]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="relative inline-flex flex-col gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-4 shadow-[10px_10px_0px_0px_var(--color-border)]">
          <div className="pointer-events-none absolute right-3 top-3 size-10 border-4 border-border bg-secondary shadow-[6px_6px_0px_0px_var(--color-border)]" />
          <h1 className="text-3xl font-extrabold uppercase tracking-wider">Користувачі</h1>
          <p className="text-muted-foreground text-sm font-semibold">
            Прогрес: курсор дня + позначки календаря за поточний місяць.
          </p>
        </div>
        <Link href="/admin/stats" className={cn(buttonVariants({ variant: "outline" }))}>
          Статистика →
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Пошук</CardTitle>
          <CardDescription>Фільтр по email (показуємо до 200 записів).</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end" action="/admin/users" method="get">
            <div className="grid gap-1.5">
              <Label htmlFor="q">Email</Label>
              <Input id="q" name="q" defaultValue={params.q ?? ""} placeholder="user@..." />
            </div>
            <SubmitButton type="submit" className="w-fit" pendingLabel="Фільтрую...">
              Знайти
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {users.map((u) => {
          const up = u.userPrograms[0];
          const counts = byUser.get(u.id) ?? { TRAINING: 0, STRETCHING: 0, REST: 0, SICK: 0 };
          const last = lastByUser.get(u.id) ?? null;
          return (
            <Card key={u.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">{u.email}</CardTitle>
                <CardDescription>
                  {u.role === "ADMIN" ? "ADMIN" : "USER"} · {u.profile?.onboardingDone ? "онбординг ✓" : "онбординг —"} ·{" "}
                  {last ? `останнє: ${last}` : "без позначок"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary text-primary-foreground">Т: {counts.TRAINING}</Badge>
                  <Badge className="bg-accent text-accent-foreground">Р: {counts.STRETCHING}</Badge>
                  <Badge variant="secondary">В: {counts.REST}</Badge>
                  <Badge variant="outline">Х: {counts.SICK}</Badge>
                </div>

                <div className="rounded-[var(--radius)] border-4 border-border bg-background p-3 shadow-[6px_6px_0px_0px_var(--color-border)]">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Програма</div>
                  <div className="mt-1 text-sm font-black">
                    {up ? `${up.program.name} · день ${up.cursorDay}/${up.program.durationDays}` : "не стартував"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/users/${u.id}`} className={cn(buttonVariants(), "w-full sm:w-auto")}>
                    Деталі
                  </Link>
                  <AdminMutationForm
                    action={updateUserRoleAction}
                    successMessage="Роль користувача оновлено."
                    className="flex flex-1 items-center gap-2"
                  >
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="role"
                      className="border-input bg-background h-9 flex-1 rounded-[var(--radius)] border-4 px-2 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)]"
                      defaultValue={u.role}
                      aria-label="Роль"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <SubmitButton size="sm" variant="secondary" className="w-fit" pendingLabel="...">
                      OK
                    </SubmitButton>
                  </AdminMutationForm>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

