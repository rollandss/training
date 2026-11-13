"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type TrainingVolumeMode } from "@/lib/calendar-access";
import { CALENDAR_STATUS_UI } from "@/lib/calendar-status";
import { summarizeTrainingLines } from "@/lib/user-exercise-utils";
import { cn } from "@/lib/utils";
import { formatDayKeyUk } from "@/lib/date-format";

import { type TrainingDayFormValue, type TrainingExerciseLineFormValue, type TrainingVolumeProgress } from "./training-day-form";
import { TrainingDaySessionForm } from "./training-day-session-form";
import { TrainingDaySetupForm } from "./training-day-setup-form";
import { TrainingRestOverlayPresence } from "./training-rest-overlay";
import { saveCalendarDayAction, type CalendarStatus, type CalendarStatusOrNone } from "./actions";

type TrainingEntry = {
  mode: TrainingVolumeMode;
  rounds: number;
  notes: string | null;
  lines: TrainingExerciseLineFormValue[];
};

type DayStep = "choose" | "setup" | "session";

function buildTrainingConfig(
  training: TrainingEntry | undefined,
  fallbackLines: TrainingExerciseLineFormValue[],
): TrainingDayFormValue {
  return {
    mode: training?.mode ?? "ROUNDS",
    rounds: training?.rounds ?? 4,
    lines: training?.lines ?? fallbackLines,
  };
}

export function CalendarDayCell(props: {
  dayNum: number;
  programDay: number;
  dayKey: string;
  locked: boolean;
  isToday?: boolean;
  /** Open the sheet on mount (e.g. /app/calendar?open=YYYY-MM-DD from the dashboard). */
  defaultOpen?: boolean;
  postSlug?: string | null;
  status?: CalendarStatus;
  trainingLines: TrainingExerciseLineFormValue[];
  training?: TrainingEntry;
}) {
  const { dayNum, programDay, dayKey, locked, isToday, defaultOpen, postSlug, status, trainingLines, training } = props;
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  /** Remove ?open=… so a reload doesn't pop the sheet again. */
  const dropOpenParam = React.useCallback(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("open")) return;
    url.searchParams.delete("open");
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }, [router]);

  const [open, setOpen] = React.useState(Boolean(defaultOpen) && !locked);
  const [step, setStep] = React.useState<DayStep>("choose");
  const [localStatus, setLocalStatus] = React.useState<CalendarStatusOrNone>(status ?? "NONE");
  const [trainingConfig, setTrainingConfig] = React.useState<TrainingDayFormValue>(() =>
    buildTrainingConfig(training, trainingLines),
  );
  const [restSeconds, setRestSeconds] = React.useState(60);
  const [restRemaining, setRestRemaining] = React.useState<number | null>(null);
  const [restDurationTotal, setRestDurationTotal] = React.useState(60);
  const [timerTitle, setTimerTitle] = React.useState("Відпочинок");
  const [timerSubtitle, setTimerSubtitle] = React.useState("Дочекайся сигналу або пропусти таймер");
  const [timerSkipLabel, setTimerSkipLabel] = React.useState("Пропустити");
  const [volumeProgress, setVolumeProgress] = React.useState<TrainingVolumeProgress | null>(null);
  const [notes, setNotes] = React.useState(training?.notes ?? "");
  const intervalRef = React.useRef<number | null>(null);

  const stopRestTimer = React.useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRestRemaining(null);
  }, []);

  const startCountdown = React.useCallback(
    (
      seconds: number,
      labels: {
        title: string;
        subtitle: string;
        skipLabel: string;
      },
    ) => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const startedAt = Date.now();
      const durationMs = seconds * 1000;
      setTimerTitle(labels.title);
      setTimerSubtitle(labels.subtitle);
      setTimerSkipLabel(labels.skipLabel);
      setRestDurationTotal(seconds);
      setRestRemaining(seconds);
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.ceil((durationMs - elapsed) / 1000);
        if (remaining <= 0) {
          if (intervalRef.current != null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setRestRemaining(null);
          return;
        }
        setRestRemaining(remaining);
      }, 250);
    },
    [],
  );

  const startRestTimer = React.useCallback(() => {
    startCountdown(restSeconds, {
      title: "Відпочинок",
      subtitle: "Дочекайся сигналу або пропусти таймер",
      skipLabel: "Пропустити",
    });
  }, [restSeconds, startCountdown]);

  const startExerciseTimer = React.useCallback(
    (payload: { label: string; seconds: number }) => {
      startCountdown(payload.seconds, {
        title: payload.label,
        subtitle: "Виконай вправу до сигналу або пропусти таймер",
        skipLabel: "Пропустити",
      });
    },
    [startCountdown],
  );

  React.useEffect(() => {
    return () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
  }, []);

  const trainingSummary = training
    ? `${training.mode === "SETS" ? "Підх." : "Кіл"} ${training.rounds} · ${summarizeTrainingLines(training.lines)}`
    : null;
  const sessionActive = step === "session";
  // "NONE" is savable only when it clears an existing mark (previously the footer vanished, so clearing was impossible).
  const canSaveFromChoose = localStatus !== "TRAINING" && (localStatus !== "NONE" || status != null);
  const dateLabel = formatDayKeyUk(dayKey);
  const sessionKey = `${dayKey}-${trainingConfig.mode}-${trainingConfig.rounds}-${trainingConfig.lines.map((line) => line.exerciseId).join(",")}`;

  const volumeProgressLabel =
    volumeProgress == null
      ? null
      : volumeProgress.mode === "ROUNDS"
        ? "Коло"
        : "Підхід";

  return (
    <Sheet
      open={open}
      disablePointerDismissal={sessionActive}
      onOpenChange={(v) => {
        if (locked) {
          setOpen(false);
          return;
        }
        if (v) {
          setLocalStatus(status ?? "NONE");
          setStep("choose");
          setTrainingConfig(buildTrainingConfig(training, trainingLines));
          setVolumeProgress(null);
          setNotes(training?.notes ?? "");
          stopRestTimer();
          setOpen(true);
          return;
        }
        if (sessionActive && !window.confirm("Закрити заняття без збереження?")) {
          setOpen(true);
          return;
        }
        stopRestTimer();
        setStep("choose");
        setOpen(false);
        if (defaultOpen) dropOpenParam();
      }}
    >
      <SheetTrigger
        disabled={locked}
        render={
          <button
            type="button"
            className={cn(
              "relative flex h-14 w-full min-w-0 flex-col rounded-[var(--radius)] border-2 border-border bg-card p-1.5 text-left sm:h-[7rem] sm:border-4 sm:p-2 sm:shadow-[6px_6px_0px_0px_var(--color-border)]",
              status ? CALENDAR_STATUS_UI[status].cellClassName : "bg-card text-foreground",
              locked && "border-dashed border-foreground/25 bg-transparent text-foreground/40 shadow-none sm:shadow-none",
              isToday && "ring-4 ring-foreground ring-offset-2 ring-offset-background",
              !locked &&
                "transition-[transform,box-shadow] sm:hover:-translate-x-0.5 sm:hover:-translate-y-0.5 sm:hover:shadow-[8px_8px_0px_0px_var(--color-border)] sm:active:translate-x-0.5 sm:active:translate-y-0.5",
            )}
            aria-label={`${dateLabel}, день ${programDay}${isToday ? ", сьогодні" : ""}`}
            aria-current={isToday ? "date" : undefined}
          >
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xs font-black sm:text-sm">{dayNum}</span>
              {isToday ? (
                <span className="hidden rounded-sm bg-foreground px-1 text-[10px] font-black text-background sm:inline">
                  Сьогодні
                </span>
              ) : null}
            </div>

            {status === "TRAINING" && trainingSummary ? (
              <div className="mt-1 hidden line-clamp-2 text-[11px] font-semibold opacity-90 sm:block">{trainingSummary}</div>
            ) : null}

            {!locked ? (
              <div className="mt-auto hidden text-[10px] font-bold opacity-60 sm:block">
                День {programDay}
              </div>
            ) : null}

            {locked ? (
              <div className="pointer-events-none absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                <Lock className="size-3 sm:size-3.5" aria-hidden />
              </div>
            ) : null}
          </button>
        }
      />

      <SheetContent
        side="bottom"
        className={cn(
          "flex w-full max-w-none flex-col gap-0 overflow-hidden border-4 border-border p-0 shadow-[10px_10px_0px_0px_var(--color-border)] sm:mx-auto sm:max-w-lg",
          sessionActive
            ? "h-dvh max-h-dvh rounded-none data-[side=bottom]:h-dvh"
            : "h-[min(92dvh,100svh)] max-h-[92dvh] rounded-t-[var(--radius)]",
        )}
      >
        <SheetHeader className="shrink-0 border-b-4 border-border px-4 py-3 pr-14">
          <SheetTitle className="text-lg font-black">День {programDay}</SheetTitle>
          <SheetDescription className="text-xs font-medium">
            {step === "choose"
              ? "Обери тип дня."
              : step === "setup"
                ? "Налаштуй план заняття: круги, порядок вправ і цілі."
                : volumeProgress && volumeProgressLabel
                  ? `${volumeProgressLabel} ${volumeProgress.active} з ${volumeProgress.rounds}`
                  : "Проведи заняття за планом."}
          </SheetDescription>
        </SheetHeader>

        <form
          action={async (fd) => {
            try {
              await saveCalendarDayAction(fd);
              toast.success("День збережено");
              setStep("choose");
              setOpen(false);
              if (defaultOpen) dropOpenParam();
            } catch {
              toast.error("Не вдалося зберегти день");
            }
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <input type="hidden" name="dayKey" value={dayKey} />
          <input type="hidden" name="notes" value={notes} />
          {localStatus === "TRAINING" ? (
            <>
              <input type="hidden" name="mode" value={trainingConfig.mode} />
              <input type="hidden" name="rounds" value={trainingConfig.rounds} />
              <input
                type="hidden"
                name="exerciseLinesJson"
                value={JSON.stringify(
                  trainingConfig.lines.map((line) => ({
                    exerciseId: line.exerciseId,
                    reps: line.reps,
                  })),
                )}
              />
            </>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <input type="hidden" name="status" value={localStatus} />
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <CardDescription className="text-xs font-semibold first-letter:uppercase">{dateLabel}</CardDescription>
              {postSlug && step === "choose" ? (
                <Link
                  href={`/app/post/${postSlug}`}
                  className="inline-flex items-center gap-1 text-xs font-black underline underline-offset-4"
                >
                  <BookOpen className="size-3.5" /> Пост дня {programDay}
                </Link>
              ) : null}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === "choose" ? (
                <motion.div
                  key="choose"
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-4"
                >
                <div className="grid gap-2">
                <CardTitle className="text-base font-black">Тип дня</CardTitle>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CALENDAR_STATUS_UI) as CalendarStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setLocalStatus(s);
                        if (s === "TRAINING") {
                          setStep("setup");
                        } else {
                          setStep("choose");
                        }
                      }}
                      className={cn(
                        "rounded-[var(--radius)] border-4 border-border px-3 py-3 text-left text-xs font-black shadow-[6px_6px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5",
                        localStatus === s ? CALENDAR_STATUS_UI[s].pickerClassName : "bg-background text-foreground",
                      )}
                      aria-pressed={localStatus === s}
                    >
                      <div>{CALENDAR_STATUS_UI[s].label}</div>
                      {CALENDAR_STATUS_UI[s].hint ? (
                        <div className="mt-1 text-[11px] font-semibold opacity-80">{CALENDAR_STATUS_UI[s].hint}</div>
                      ) : null}
                    </button>
                  ))}
                  {status ? (
                    <button
                      type="button"
                      onClick={() => setLocalStatus("NONE")}
                      className={cn(
                        "col-span-2 rounded-[var(--radius)] border-4 border-dashed border-border bg-background px-3 py-2.5 text-left text-xs font-black transition-colors hover:bg-muted",
                        localStatus === "NONE" && "bg-muted",
                      )}
                      aria-pressed={localStatus === "NONE"}
                    >
                      Зняти позначку
                    </button>
                  ) : null}
                </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`notes-${dayKey}`} className="text-xs">
                    Нотатки (опц.)
                  </Label>
                  <Textarea
                    id={`notes-${dayKey}`}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Напр.: важко на останніх колах..."
                  />
                </div>
                {localStatus === "TRAINING" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="font-black"
                      onClick={() => setStep("setup")}
                    >
                      Налаштування заняття
                    </Button>
                    <Button type="button" className="font-black" onClick={() => setStep("session")}>
                      Провести заняття
                    </Button>
                  </div>
                ) : null}
                </motion.div>
              ) : step === "setup" ? (
                <motion.div
                  key="setup"
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrainingDaySetupForm
                    value={trainingConfig}
                    restSeconds={restSeconds}
                    onChange={setTrainingConfig}
                    onRestSecondsChange={setRestSeconds}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="session"
                  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrainingDaySessionForm
                    key={sessionKey}
                    value={trainingConfig}
                    restRemaining={restRemaining}
                    onChange={setTrainingConfig}
                    onStartRest={startRestTimer}
                    onStartExerciseTimer={startExerciseTimer}
                    onActiveVolumeChange={setVolumeProgress}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step === "setup" ? (
            <SheetFooter className="shrink-0 border-t-4 border-border bg-popover px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <div className="grid w-full gap-2">
                <Button
                  type="button"
                  className="w-full font-black"
                  onClick={() => setStep("session")}
                >
                  Почати заняття
                </Button>
                <SubmitButton className="w-full" pendingLabel="Зберігаю...">
                  Зберегти план
                </SubmitButton>
              </div>
            </SheetFooter>
          ) : step === "session" || canSaveFromChoose ? (
            <SheetFooter className="shrink-0 border-t-4 border-border bg-popover px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <SubmitButton className="w-full" pendingLabel="Зберігаю...">
                Зберегти
              </SubmitButton>
            </SheetFooter>
          ) : null}
        </form>
      </SheetContent>
      <TrainingRestOverlayPresence
        open={sessionActive && restRemaining != null}
        totalSeconds={restDurationTotal}
        remainingSeconds={restRemaining ?? 0}
        onSkip={stopRestTimer}
        title={timerTitle}
        subtitle={timerSubtitle}
        skipLabel={timerSkipLabel}
      />
    </Sheet>
  );
}
