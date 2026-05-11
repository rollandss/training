"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { saveCalendarDayAction, type CalendarStatus, type CalendarStatusOrNone } from "./actions";

const STATUS_UI: Record<
  CalendarStatus,
  {
    label: string;
    className: string;
    short: string;
    hint?: string;
  }
> = {
  TRAINING: { label: "Тренування", short: "Т", className: "bg-primary text-primary-foreground" },
  STRETCHING: { label: "Розтяжка", short: "Р", className: "bg-accent text-accent-foreground", hint: "Легка активність/мобільність" },
  REST: { label: "Відпочинок", short: "В", className: "bg-secondary text-secondary-foreground" },
  SICK: { label: "Хвороба", short: "Х", className: "bg-destructive text-primary-foreground" },
};

type TrainingEntry = {
  rounds: number;
  pullupsReps: number;
  squatsReps: number;
  pushupsReps: number;
  lungesReps: number;
  notes: string | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatMmSs(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
}

export function CalendarDayCell(props: {
  dayNum: number;
  dayKey: string;
  locked: boolean;
  status?: CalendarStatus;
  training?: TrainingEntry;
}) {
  const { dayNum, dayKey, locked, status, training } = props;

  const [open, setOpen] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState<CalendarStatusOrNone>(status ?? "NONE");
  const [restSeconds, setRestSeconds] = React.useState(60);
  const [restRemaining, setRestRemaining] = React.useState<number | null>(null);
  const intervalRef = React.useRef<number | null>(null);

  const stopRestTimer = React.useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRestRemaining(null);
  }, []);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (locked) {
          setOpen(false);
          return;
        }
        if (v) {
          setLocalStatus(status ?? "NONE");
          stopRestTimer();
        }
        setOpen(v);
      }}
    >
      <SheetTrigger
        disabled={locked}
        render={
          <button
            type="button"
            className={cn(
              "relative flex h-[92px] sm:h-[112px] w-full flex-col rounded-[var(--radius)] border-4 border-border bg-card p-2 text-left shadow-[8px_8px_0px_0px_var(--color-border)]",
              locked && "opacity-95",
              !locked &&
                "transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5",
            )}
            aria-label={`День ${dayNum}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-black">{dayNum}</div>
              {status ? (
                <div
                  className={cn(
                    "inline-flex items-center rounded-[var(--radius)] border-4 border-border px-2 py-1 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)]",
                    STATUS_UI[status].className,
                  )}
                  title={STATUS_UI[status].label}
                >
                  {STATUS_UI[status].short}
                </div>
              ) : (
                <div className="text-xs font-semibold text-muted-foreground">—</div>
              )}
            </div>

            {status === "TRAINING" && training ? (
              <div className="mt-2 text-xs font-semibold text-muted-foreground">
                {training.rounds} кіл · П{training.pullupsReps} · Пр{training.squatsReps} · Вд{training.pushupsReps} · Вп{training.lungesReps}
              </div>
            ) : null}

            {locked ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="bg-card border-4 border-border p-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
                  <Lock className="size-6 text-foreground" />
                </div>
              </div>
            ) : null}
          </button>
        }
      />

      <SheetContent side="right" className="border-4 border-border shadow-[10px_10px_0px_0px_var(--color-border)]">
        <SheetHeader>
          <SheetTitle className="text-xl font-black">День {dayNum}</SheetTitle>
          <SheetDescription className="font-medium">
            Обери тип дня. Для “Тренування” заповни кола і повтори по вправах.
          </SheetDescription>
        </SheetHeader>

        <form
          action={async (fd) => {
            await saveCalendarDayAction(fd);
            setOpen(false);
          }}
          className="flex h-full flex-col"
        >
          <input type="hidden" name="dayKey" value={dayKey} />

          <div className="px-4 pb-4">
            <div className="grid gap-2">
              <CardTitle className="text-base font-black">Тип дня</CardTitle>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STATUS_UI) as CalendarStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLocalStatus(s)}
                    className={cn(
                      "rounded-[var(--radius)] border-4 border-border px-3 py-3 text-left text-xs font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5",
                      localStatus === s ? STATUS_UI[s].className : "bg-background text-foreground",
                    )}
                    aria-pressed={localStatus === s}
                  >
                    <div>{STATUS_UI[s].label}</div>
                    {STATUS_UI[s].hint ? <div className="mt-1 text-[11px] font-semibold opacity-80">{STATUS_UI[s].hint}</div> : null}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLocalStatus("NONE")}
                  className={cn(
                    "col-span-2 rounded-[var(--radius)] border-4 border-border bg-background px-3 py-3 text-left text-xs font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5",
                    localStatus === "NONE" && "bg-muted",
                  )}
                  aria-pressed={localStatus === "NONE"}
                >
                  Очистити (—)
                </button>
              </div>

              <input type="hidden" name="status" value={localStatus} />
              <CardDescription className="text-xs">
                Дата: <span className="font-mono">{dayKey}</span>
              </CardDescription>
            </div>

            {localStatus === "TRAINING" ? (
              <div className="mt-5 grid gap-4">
                <div className="rounded-[var(--radius)] border-4 border-border bg-background p-3 shadow-[8px_8px_0px_0px_var(--color-border)]">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Таймер відпочинку між колами</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="restSeconds">Секунди</Label>
                      <Input
                        id="restSeconds"
                        type="number"
                        min={10}
                        max={600}
                        value={restSeconds}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isFinite(n)) return;
                          setRestSeconds(Math.max(10, Math.min(600, Math.floor(n))));
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Залишилось</div>
                      <div className={cn("text-2xl font-black", restRemaining != null && restRemaining <= 5 && "text-destructive")}>
                        {formatMmSs(restRemaining ?? restSeconds)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="font-black uppercase tracking-wider"
                      onClick={() => {
                        stopRestTimer();
                        const startedAt = Date.now();
                        const durationMs = restSeconds * 1000;
                        setRestRemaining(restSeconds);
                        intervalRef.current = window.setInterval(() => {
                          const elapsed = Date.now() - startedAt;
                          const remaining = Math.ceil((durationMs - elapsed) / 1000);
                          if (remaining <= 0) {
                            stopRestTimer();
                            return;
                          }
                          setRestRemaining(remaining);
                        }, 250);
                      }}
                    >
                      Старт відпочинку
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="font-black uppercase tracking-wider"
                      disabled={restRemaining == null}
                      onClick={() => stopRestTimer()}
                    >
                      Стоп / скинути
                    </Button>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-muted-foreground">
                    Натисни “Старт відпочинку” після того, як завершив коло.
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="rounds">Кількість кіл</Label>
                  <Input
                    id="rounds"
                    name="rounds"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={training?.rounds ?? 4}
                  />
                </div>

                <div className="grid gap-3">
                  <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Повтори в колі</div>
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="pullupsReps">Підтягування</Label>
                      <Input id="pullupsReps" name="pullupsReps" type="number" min={0} max={500} defaultValue={training?.pullupsReps ?? ""} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="squatsReps">Присідання</Label>
                      <Input id="squatsReps" name="squatsReps" type="number" min={0} max={5000} defaultValue={training?.squatsReps ?? ""} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pushupsReps">Віджимання</Label>
                      <Input id="pushupsReps" name="pushupsReps" type="number" min={0} max={5000} defaultValue={training?.pushupsReps ?? ""} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="lungesReps">Випади</Label>
                      <Input id="lungesReps" name="lungesReps" type="number" min={0} max={5000} defaultValue={training?.lungesReps ?? ""} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Нотатки (опц.)</Label>
                  <Input id="notes" name="notes" defaultValue={training?.notes ?? ""} placeholder="Напр.: важко на останніх колах..." />
                </div>
              </div>
            ) : null}
          </div>

          <SheetFooter>
            <div className="grid gap-2">
              <SubmitButton className="w-full" pendingLabel="Зберігаю...">
                Зберегти
              </SubmitButton>
              <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Закрити
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

