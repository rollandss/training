import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { PageHeader } from "@/components/page-header";
import { StatusCounts } from "@/components/status-counts";
import { NativeSelect } from "@/components/ui/native-select";
import { Panel, PanelLabel } from "@/components/ui/panel";
import { ROLE_LABELS, roleLabel } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { AdminMutationForm } from "./admin-mutation-form";
import { createUserAction } from "./actions";
import { calendarDate } from "@/lib/progress";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthRangeUTC(d = calendarDate(new Date())) {
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
      <PageHeader
        title="Користувачі"
        description="Відкритий день і позначки календаря за поточний місяць."
        actions={
          <Link href="/admin/stats" className={cn(buttonVariants({ variant: "outline" }))}>
            Статистика
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Новий користувач</CardTitle>
            <CardDescription>Обліковий запис з порожнім профілем.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminMutationForm action={createUserAction} successMessage="Користувача створено." className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="create-email">Email</Label>
                <Input id="create-email" name="email" type="email" required placeholder="user@example.com" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="create-password">Пароль</Label>
                  <Input id="create-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="create-role">Роль</Label>
                  <NativeSelect id="create-role" name="role" defaultValue="USER">
                    <option value="USER">{ROLE_LABELS.USER}</option>
                    <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                  </NativeSelect>
                </div>
              </div>
              <SubmitButton className="w-fit" pendingLabel="Створюю...">
                Створити користувача
              </SubmitButton>
            </AdminMutationForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пошук</CardTitle>
            <CardDescription>За email. Показуємо до 200 записів.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" action="/admin/users" method="get">
              <div className="grid gap-1.5">
                <Label htmlFor="q">Email</Label>
                <Input id="q" name="q" defaultValue={params.q ?? ""} placeholder="user@..." />
              </div>
              <div className="flex flex-wrap gap-3">
                <SubmitButton type="submit" className="w-fit" pendingLabel="Шукаю...">
                  Знайти
                </SubmitButton>
                {q ? (
                  <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline" }))}>
                    Скинути
                  </Link>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4" aria-labelledby="users-list">
        <h2 id="users-list" className="font-display text-xl font-bold">
          {q ? `Знайдено: ${users.length}` : `Усі користувачі: ${users.length}`}
        </h2>
        {users.length === 0 ? (
          <Panel tone="dashed" className="text-sm font-medium">
            Нікого не знайдено. Спробуй іншу частину email.
          </Panel>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => {
            const up = u.userPrograms[0];
            const counts = byUser.get(u.id) ?? { TRAINING: 0, STRETCHING: 0, REST: 0, SICK: 0 };
            const last = lastByUser.get(u.id) ?? null;
            return (
              <Card key={u.id}>
                <CardHeader>
                  <CardTitle className="truncate" title={u.email}>
                    {u.email}
                  </CardTitle>
                  <CardDescription>
                    {roleLabel(u.role)} · {u.profile?.onboardingDone ? "анкета заповнена" : "без анкети"} ·{" "}
                    {last ? `остання позначка ${last}` : "без позначок"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Panel>
                    <PanelLabel>Програма</PanelLabel>
                    <div className="mt-1 text-sm font-bold">
                      {up ? `День ${up.cursorDay} з ${up.program.durationDays}` : "Ще не стартував"}
                    </div>
                  </Panel>
                  <StatusCounts counts={counts} />
                  <Link href={`/admin/users/${u.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    Відкрити профіль
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
