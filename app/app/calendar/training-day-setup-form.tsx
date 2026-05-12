"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { moveLine, Stepper, type TrainingDayFormValue } from "./training-day-form";

export function TrainingDaySetupForm(props: {
  value: TrainingDayFormValue;
  restSeconds: number;
  onChange: (value: TrainingDayFormValue) => void;
  onRestSecondsChange: (seconds: number) => void;
}) {
  const { value, restSeconds, onChange, onRestSecondsChange } = props;
  const reduceMotion = useReducedMotion();

  const volumeLabel = value.mode === "ROUNDS" ? "Кіл" : "Підходів";
  const targetLabel = (metric: TrainingDayFormValue["lines"][number]["metric"]) =>
    metric === "TIME" ? "Секунди" : value.mode === "ROUNDS" ? "Повтори в колі" : "Повтори в підході";

  return (
    <motion.div layout className="grid gap-4">
      <div className="rounded-[var(--radius)] border-4 border-border bg-muted/40 p-3 shadow-[6px_6px_0px_0px_var(--color-border)]">
        <motion.div layout className="text-sm font-black">План заняття</motion.div>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          Тут налаштовуєш круги, порядок вправ і цілі. Під час заняття залишаться лише поточне коло та таймери.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-[var(--radius)] border-4 border-border bg-muted/40 p-1 shadow-[6px_6px_0px_0px_var(--color-border)]">
        {(
          [
            { id: "ROUNDS" as const, label: "Круги" },
            { id: "SETS" as const, label: "Підходи" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ ...value, mode: option.id })}
            className={cn(
              "rounded-[var(--radius)] px-2 py-2 text-xs font-black uppercase tracking-wider transition-[transform,box-shadow,background-color,color] sm:text-sm",
              value.mode === option.id
                ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-border)]"
                : "bg-transparent text-foreground hover:bg-background",
            )}
            aria-pressed={value.mode === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-background px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_var(--color-border)]">
          <RotateCcw className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black leading-tight">{volumeLabel}</div>
          <div className="text-[11px] font-semibold text-muted-foreground">
            {value.mode === "ROUNDS" ? "Скільки кіл запланувати" : "Скільки підходів запланувати"}
          </div>
        </div>
        <Stepper
          value={value.rounds}
          min={1}
          max={50}
          ariaLabel={volumeLabel}
          onChange={(rounds) => onChange({ ...value, rounds })}
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Черговість і цілі</div>
        <AnimatePresence initial={false} mode="popLayout">
          {value.lines.map((line, index) => (
            <motion.div
              key={line.exerciseId}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-[var(--radius)] border-4 border-border bg-card px-2 py-2 shadow-[6px_6px_0px_0px_var(--color-border)]"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-xs font-black shadow-[4px_4px_0px_0px_var(--color-border)]">
                {line.short}
              </div>
              <div className="min-w-0 flex-1">
                <motion.div layout className="text-sm font-black leading-tight">
                  {line.label}
                </motion.div>
                <motion.div layout className="text-[11px] font-semibold text-muted-foreground">
                  {targetLabel(line.metric)}
                </motion.div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background shadow-[3px_3px_0px_0px_var(--color-border)] disabled:opacity-40"
                  onClick={() => onChange({ ...value, lines: moveLine(value.lines, index, -1) })}
                  disabled={index === 0}
                  aria-label={`${line.label}: вгору`}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background shadow-[3px_3px_0px_0px_var(--color-border)] disabled:opacity-40"
                  onClick={() => onChange({ ...value, lines: moveLine(value.lines, index, 1) })}
                  disabled={index === value.lines.length - 1}
                  aria-label={`${line.label}: вниз`}
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>
              <Stepper
                value={line.reps}
                min={line.metric === "TIME" ? 5 : 0}
                max={line.maxReps}
                ariaLabel={line.label}
                onChange={(reps) =>
                  onChange({
                    ...value,
                    lines: value.lines.map((item) => (item.exerciseId === line.exerciseId ? { ...item, reps } : item)),
                  })
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="rounded-[var(--radius)] border-4 border-border bg-background p-2.5 shadow-[8px_8px_0px_0px_var(--color-border)]">
        <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Відпочинок між колами</div>
        <div className="mt-2 grid gap-1.5">
          <Label htmlFor="restSeconds" className="text-xs">
            Секунди
          </Label>
          <Input
            id="restSeconds"
            type="number"
            min={10}
            max={600}
            className="h-9"
            value={restSeconds}
            onChange={(event) => {
              const n = Number(event.target.value);
              if (!Number.isFinite(n)) return;
              onRestSecondsChange(Math.max(10, Math.min(600, Math.floor(n))));
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
