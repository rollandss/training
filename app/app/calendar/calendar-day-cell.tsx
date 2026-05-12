"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Lock } from "lucide-react";
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
  dayKey: string;
  locked: boolean;
  status?: CalendarStatus;
  trainingLines: TrainingExerciseLineFormValue[];
  training?: TrainingEntry;
}) {
  const { dayNum, dayKey, locked, status, trainingLines, training } = props;
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = React.useState(false);
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
  const canSaveFromChoose = localStatus !== "NONE" && localStatus !== "TRAINING";
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
              locked && "opacity-80",
              !locked &&
                "transition-[transform,box-shadow] sm:hover:-translate-x-0.5 sm:hover:-translate-y-0.5 sm:hover:shadow-[8px_8px_0px_0px_var(--color-border)] sm:active:translate-x-0.5 sm:active:translate-y-0.5",
            )}
            aria-label={`День ${dayNum}`}
          >
            <div className="text-xs font-black sm:text-sm">{dayNum}</div>

            {status === "TRAINING" && trainingSummary ? (
              <div className="mt-1 hidden line-clamp-2 text-[11px] font-semibold opacity-90 sm:block">{trainingSummary}</div>
            ) : null}

            {locked ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
                <Lock className="size-4 text-foreground sm:size-5" />
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
          <SheetTitle className="text-lg font-black">День {dayNum}</SheetTitle>
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
            <CardDescription className="mb-3 text-xs">
              Дата: <span className="font-mono">{dayKey}</span>
            </CardDescription>

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
                        "rounded-[var(--radius)] border-4 border-border px-3 py-3 text-left text-xs font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_var(--color-border)] active:translate-x-0.5 active:translate-y-0.5",
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
                </div>
                {localStatus === "TRAINING" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="font-black uppercase tracking-wider"
                      onClick={() => setStep("setup")}
                    >
                      Налаштування заняття
                    </Button>
                    <Button type="button" className="font-black uppercase tracking-wider" onClick={() => setStep("session")}>
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
                  className="w-full font-black uppercase tracking-wider"
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
