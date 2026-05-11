import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { AdminDeleteUserForm } from "../delete-user-form";
import { AdminMutationForm } from "../admin-mutation-form";
import { updateUserAccountAction, updateUserCursorDayAction } from "../actions";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDayKeyUTC(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function monthRangeKeysUTC(d = new Date()) {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative inline-flex flex-col gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-4 shadow-[10px_10px_0px_0px_var(--color-border)]">
          <div className="pointer-events-none absolute right-3 top-3 size-10 border-4 border-border bg-primary shadow-[6px_6px_0px_0px_var(--color-border)]" />
          <h1 className="text-2xl font-extrabold uppercase tracking-wider">{user.email}</h1>
          <p className="text-muted-foreground text-sm font-semibold">
            {user.role} · {user.profile?.onboardingDone ? "онбординг ✓" : "онбординг —"} · створено {user.createdAt.toISOString().slice(0, 10)}
          </p>
        </div>
        <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline" }))}>
          ← До списку
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Прогрес</CardTitle>
            <CardDescription>Поточна програма + редагування курсора дня.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius)] border-4 border-border bg-background p-4 shadow-[8px_8px_0px_0px_var(--color-border)]">
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Програма</div>
              <div className="mt-1 text-sm font-black">
                {up ? `${up.program.name} · день ${up.cursorDay}/${up.program.durationDays}` : "не стартував"}
              </div>
              {up ? (
                <AdminMutationForm
                  action={updateUserCursorDayAction}
                  successMessage="Відкритий день збережено. Пости й календар оновляться для користувача."
                  className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="programId" value={up.programId} />
                  <div className="grid gap-1.5">
                    <Label htmlFor="cursorDay">Відкритий день (1-100)</Label>
                    <Input id="cursorDay" name="cursorDay" type="number" min={1} max={100} defaultValue={up.cursorDay} />
                  </div>
                  <SubmitButton variant="secondary" className="w-fit" pendingLabel="Зберігаю...">
                    Зберегти
                  </SubmitButton>
                </AdminMutationForm>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Цей місяць</CardTitle>
                  <CardDescription>{monthKey}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge className="bg-primary text-primary-foreground">Т: {map.get("TRAINING") ?? 0}</Badge>
                <Badge className="bg-accent text-accent-foreground">Р: {map.get("STRETCHING") ?? 0}</Badge>
                  <Badge variant="secondary">В: {map.get("REST") ?? 0}</Badge>
                  <Badge variant="outline">Х: {map.get("SICK") ?? 0}</Badge>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Останні позначки</CardTitle>
                  <CardDescription>Останні 21 день з календаря</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {recent.length ? (
                    recent.map((r) => (
                      <div key={r.dayKey} className="flex items-center justify-between gap-3 text-sm">
                        <div className="font-mono text-xs">{r.dayKey}</div>
                        <div className="font-black uppercase tracking-wider">{r.status}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">Немає записів</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Обліковий запис</CardTitle>
            <CardDescription>Email, пароль і роль користувача.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminMutationForm action={updateUserAccountAction} successMessage="Обліковий запис оновлено." className="grid gap-3">
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
                  placeholder="Залиште порожнім, щоб не змінювати"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  name="role"
                  className="border-input bg-background h-10 rounded-[var(--radius)] border-4 px-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)]"
                  defaultValue={user.role}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <SubmitButton variant="secondary" className="w-fit" pendingLabel="Зберігаю...">
                Зберегти обліковий запис
              </SubmitButton>
            </AdminMutationForm>

            <AdminDeleteUserForm userId={user.id} disabled={me.id === user.id} />

            <div className="rounded-[var(--radius)] border-4 border-border bg-background p-4 shadow-[8px_8px_0px_0px_var(--color-border)]">
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Профіль</div>
              <div className="mt-2 space-y-1 text-sm font-medium text-muted-foreground">
                <div>
                  <span className="font-black text-foreground">Рівень:</span> {user.profile?.levelSelfAssessment ?? "—"}
                </div>
                <div>
                  <span className="font-black text-foreground">Обмеження:</span> {user.profile?.limitations ?? "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Календар (місяць)</CardTitle>
          <CardDescription>Читання по днях для цього користувача (поточний місяць).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-[var(--radius)] border-4 border-border bg-primary p-3 text-sm font-black uppercase tracking-wider text-primary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]">
              TRAINING
            </div>
            <div className="rounded-[var(--radius)] border-4 border-border bg-accent p-3 text-sm font-black uppercase tracking-wider text-accent-foreground shadow-[8px_8px_0px_0px_var(--color-border)]">
              STRETCHING
            </div>
            <div className="rounded-[var(--radius)] border-4 border-border bg-secondary p-3 text-sm font-black uppercase tracking-wider text-secondary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]">
              REST
            </div>
            <div className="rounded-[var(--radius)] border-4 border-border bg-destructive p-3 text-sm font-black uppercase tracking-wider text-primary-foreground shadow-[8px_8px_0px_0px_var(--color-border)]">
              SICK
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-muted-foreground">
            Діапазон: <span className="font-mono text-xs">{startKey}</span> … <span className="font-mono text-xs">{endKeyExclusive}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

