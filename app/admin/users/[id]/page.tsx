import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StatusCounts } from "@/components/status-counts";
import { NativeSelect } from "@/components/ui/native-select";
import { Panel } from "@/components/ui/panel";
import type { CalendarStatus } from "@/app/app/calendar/actions";
import { CALENDAR_STATUS_UI } from "@/lib/calendar-status";
import { pullupLevelLabel } from "@/lib/levels";
import { ROLE_LABELS, roleLabel } from "@/lib/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { AdminDeleteUserForm } from "../delete-user-form";
import { AdminResetProgramForm } from "../reset-program-form";
import { AdminMutationForm } from "../admin-mutation-form";
import { updateUserAccountAction, updateUserCursorDayAction } from "../actions";
import { calendarDate } from "@/lib/progress";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDayKeyUTC(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function monthRangeKeysUTC(d = calendarDate(new Date())) {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return { startKey: toDayKeyUTC(start), endKeyExclusive: toDayKeyUTC(end), monthKey: `${start.getUTCFullYear()}-${pad2(start.getUTCMonth() + 1)}` };
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/app");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: { select: { onboardingDone: true, limitations: true, levelSelfAssessment: true } },
      userPrograms: {
        take: 1,
        orderBy: { startedAt: "desc" },
        select: { programId: true, cursorDay: true, startedAt: true, program: { select: { name: true, durationDays: true } } },
      },
    },
  });
  if (!user) notFound();

  const { startKey, endKeyExclusive, monthKey } = monthRangeKeysUTC();

  const counts = await prisma.userCalendarDay.groupBy({
    by: ["status"],
    where: { userId: user.id, dayKey: { gte: startKey, lt: endKeyExclusive } },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.status, c._count._all]));

  const recent = await prisma.userCalendarDay.findMany({
    where: { userId: user.id },
    orderBy: { dayKey: "desc" },
    take: 21,
    select: { dayKey: true, status: true },
  });

  const up = user.userPrograms[0] ?? null;
  const monthLabel = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${monthKey}-01T00:00:00Z`))
    .replace(/\s*р\.$/, "");

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={
          <Link href="/admin/users" className="underline decoration-2 underline-offset-4 hover:no-underline">
            ← Усі користувачі
          </Link>
        }
        title={user.email}
        description={`${roleLabel(user.role)} · ${user.profile?.onboardingDone ? "анкета заповнена" : "без анкети"} · зареєстровано ${user.createdAt.toISOString().slice(0, 10)}`}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Прогрес</CardTitle>
            <CardDescription>{up ? up.program.name : "Програму ще не розпочато."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {up ? (
              <AdminMutationForm
                action={updateUserCursorDayAction}
                successMessage="Відкритий день збережено. Пости й календар оновляться для користувача."
                className="grid gap-3 sm:grid-cols-[minmax(0,14rem)_auto] sm:items-end"
              >
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="programId" value={up.programId} />
                <div className="grid gap-1.5">
                  <Label htmlFor="cursorDay">Відкритий день (з {up.program.durationDays})</Label>
                  <Input id="cursorDay" name="cursorDay" type="number" min={1} max={up.program.durationDays} defaultValue={up.cursorDay} />
                </div>
                <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
                  Зберегти день
                </SubmitButton>
              </AdminMutationForm>
            ) : null}

            {up ? <AdminResetProgramForm userId={user.id} /> : null}

            <div className="space-y-2">
              <h3 className="text-sm font-bold first-letter:uppercase">{monthLabel}</h3>
              <StatusCounts counts={map} />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold">Останні позначки</h3>
              {recent.length ? (
                <ul className="divide-y-2 divide-border border-2 border-border">
                  {recent.map((r) => {
                    const ui = CALENDAR_STATUS_UI[r.status as CalendarStatus];
                    return (
                      <li key={r.dayKey} className="flex items-center justify-between gap-3 bg-card px-3 py-2 text-sm">
                        <span className="tabular-nums">{r.dayKey}</span>
                        {ui ? <Badge className={ui.pickerClassName}>{ui.label}</Badge> : <span>{r.status}</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Panel tone="dashed" className="text-sm font-medium">
                  Позначок у календарі ще немає.
                </Panel>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Обліковий запис</CardTitle>
              <CardDescription>Email, пароль і роль.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminMutationForm action={updateUserAccountAction} successMessage="Обліковий запис оновлено." className="grid gap-4">
                <input type="hidden" name="userId" value={user.id} />
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Новий пароль</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Порожньо — без змін"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="role">Роль</Label>
                  <NativeSelect id="role" name="role" defaultValue={user.role}>
                    <option value="USER">{ROLE_LABELS.USER}</option>
                    <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                  </NativeSelect>
                </div>
                <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
                  Зберегти зміни
                </SubmitButton>
              </AdminMutationForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Анкета</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="font-bold">Підтягування на старті</dt>
                  <dd className="text-muted-foreground">{pullupLevelLabel(user.profile?.levelSelfAssessment) ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-bold">Обмеження</dt>
                  <dd className="text-muted-foreground">{user.profile?.limitations || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Видалення</CardTitle>
              <CardDescription>
                {me.id === user.id ? "Себе видалити не можна." : "Видаляє обліковий запис і весь прогрес без можливості відновити."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminDeleteUserForm userId={user.id} disabled={me.id === user.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
