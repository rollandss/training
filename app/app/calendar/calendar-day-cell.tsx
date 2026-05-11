"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type TrainingVolumeMode } from "@/lib/calendar-access";
import { resolveTrainingReps, type TrainingRepValues } from "@/lib/training-exercises";
import { cn } from "@/lib/utils";

import { TrainingDayForm } from "./training-day-form";
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
  mode: TrainingVolumeMode;
  rounds: number;
  pullupsReps: number;
  squatsReps: number;
  pushupsReps: number;
  lungesReps: number;
  notes: string | null;
};

export function CalendarDayCell(props: {
  dayNum: number;
  dayKey: string;
  locked: boolean;
  status?: CalendarStatus;
  trainingRepDefaults: TrainingRepValues;
  training?: TrainingEntry;
}) {
  const { dayNum, dayKey, locked, status, trainingRepDefaults, training } = props;

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

  const startRestTimer = React.useCallback(() => {
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
  }, [restSeconds, stopRestTimer]);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
  }, []);

  const trainingSummary = training
    ? `${training.mode === "SETS" ? "Підх." : "Кіл"} ${training.rounds} · П${training.pullupsReps} · Пр${training.squatsReps} · Вд${training.pushupsReps} · Вп${training.lungesReps}`
    : null;
  const trainingActive = localStatus === "TRAINING";
  const trainingInitial = resolveTrainingReps(
    trainingRepDefaults,
    training
      ? {
          pullupsReps: training.pullupsReps,
          squatsReps: training.squatsReps,
          pushupsReps: training.pushupsReps,
          lungesReps: training.lungesReps,
        }
      : undefined,
  );

  const requestClose = React.useCallback(() => {
    if (trainingActive && !window.confirm("Закрити заняття без збереження?")) {
      return;
    }
    stopRestTimer();
    setOpen(false);
  }, [stopRestTimer, trainingActive]);

  return (
    <Sheet
      open={open}
      disablePointerDismissal={trainingActive}
      onOpenChange={(v) => {
        if (locked) {
          setOpen(false);
          return;
        }
        if (v) {
          setLocalStatus(status ?? "NONE");
          stopRestTimer();
          setOpen(true);
          return;
        }
        if (trainingActive && !window.confirm("Закрити заняття без збереження?")) {
          setOpen(true);
          return;
        }
        stopRestTimer();
        setOpen(false);
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

            {status === "TRAINING" && trainingSummary ? (
              <div className="mt-2 line-clamp-2 text-xs font-semibold text-muted-foreground">{trainingSummary}</div>
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

      <SheetContent
        side="bottom"
        showCloseButton={!trainingActive}
        className="h-[min(96dvh,48rem)] w-full max-w-none overflow-hidden rounded-t-[var(--radius)] border-4 border-border shadow-[10px_10px_0px_0px_var(--color-border)] sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-xl font-black">День {dayNum}</SheetTitle>
          <SheetDescription className="font-medium">
            Обери тип дня. Для тренування задай круги або підходи та повтори по вправах.
          </SheetDescription>
        </SheetHeader>

        <form
          action={async (fd) => {
            await saveCalendarDayAction(fd);
            setOpen(false);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <input type="hidden" name="dayKey" value={dayKey} />

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
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
              <div className="mt-5">
                <TrainingDayForm
                  key={`${dayKey}-${open ? "open" : "closed"}`}
                  initial={{
                    mode: training?.mode ?? "ROUNDS",
                    rounds: training?.rounds ?? 4,
                    pullupsReps: trainingInitial.pullupsReps,
                    squatsReps: trainingInitial.squatsReps,
                    pushupsReps: trainingInitial.pushupsReps,
                    lungesReps: trainingInitial.lungesReps,
                    notes: training?.notes ?? "",
                  }}
                  restSeconds={restSeconds}
                  restRemaining={restRemaining}
                  onRestSecondsChange={setRestSeconds}
                  onStartRest={startRestTimer}
                  onStopRest={stopRestTimer}
                />
              </div>
            ) : null}
          </div>

          <SheetFooter className="shrink-0 border-t-4 border-border bg-popover">
            <div className="grid w-full gap-2">
              <SubmitButton className="w-full" pendingLabel="Зберігаю...">
                Зберегти
              </SubmitButton>
              <Button type="button" variant="outline" className="w-full" onClick={requestClose}>
                Закрити
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
