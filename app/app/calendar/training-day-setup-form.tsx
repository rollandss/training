"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RotateCcw, Timer } from "lucide-react";

import { ExerciseMark } from "@/components/exercise-mark";
import { ReorderButtons } from "@/components/reorder-buttons";
import { SegmentedControl } from "@/components/ui/segmented-control";

import { moveLine, Stepper, type TrainingDayFormValue } from "./training-day-form";

function Row({ mark, title, hint, children }: { mark: React.ReactNode; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      {mark}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      {children}
    </div>
  );
}

export function TrainingDaySetupForm(props: {
  value: TrainingDayFormValue;
  restSeconds: number;
  onChange: (value: TrainingDayFormValue) => void;
  onRestSecondsChange: (seconds: number) => void;
}) {
  const { value, restSeconds, onChange, onRestSecondsChange } = props;
  const reduceMotion = useReducedMotion();
  const isRounds = value.mode === "ROUNDS";

  const targetLabel = (metric: TrainingDayFormValue["lines"][number]["metric"]) =>
    metric === "TIME" ? (isRounds ? "Секунд у колі" : "Секунд у підході") : isRounds ? "Повторів у колі" : "Повторів у підході";

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <div className="text-sm font-bold">Формат</div>
        <SegmentedControl
          label="Формат заняття"
          value={value.mode}
          onChange={(mode) => onChange({ ...value, mode })}
          options={[
            { value: "ROUNDS", label: "Колами" },
            { value: "SETS", label: "Підходами" },
          ]}
        />
      </div>

      <div className="divide-y-2 divide-border rounded-[var(--radius)] border-2 border-border bg-card">
        <Row
          mark={
            <ExerciseMark className="bg-muted text-foreground">
              <RotateCcw className="size-4" />
            </ExerciseMark>
          }
          title={isRounds ? "Кола" : "Підходи"}
          hint={isRounds ? "Скільки кіл зробиш" : "Скільки підходів у кожній вправі"}
        >
          <Stepper
            value={value.rounds}
            min={1}
            max={50}
            ariaLabel={isRounds ? "Кола" : "Підходи"}
            onChange={(rounds) => onChange({ ...value, rounds })}
          />
        </Row>
        <Row
          mark={
            <ExerciseMark className="bg-muted text-foreground">
              <Timer className="size-4" />
            </ExerciseMark>
          }
          title="Відпочинок"
          hint={isRounds ? "Між колами" : "Між підходами"}
        >
          <Stepper value={restSeconds} min={10} max={600} step={10} suffix="с" ariaLabel="Відпочинок, секунд" onChange={onRestSecondsChange} />
        </Row>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-bold">Вправи і порядок</div>
        <ul className="divide-y-2 divide-border rounded-[var(--radius)] border-2 border-border bg-card">
          <AnimatePresence initial={false} mode="popLayout">
            {value.lines.map((line, index) => (
              <motion.li
                key={line.exerciseId}
                layout
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-wrap items-center gap-3 px-3 py-3"
              >
                <ExerciseMark>{line.short}</ExerciseMark>
                <div className="min-w-[8rem] flex-1">
                  <div className="text-sm font-bold leading-tight">{line.label}</div>
                  <div className="text-xs text-muted-foreground">{targetLabel(line.metric)}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ReorderButtons
                    label={line.label}
                    onUp={() => onChange({ ...value, lines: moveLine(value.lines, index, -1) })}
                    onDown={() => onChange({ ...value, lines: moveLine(value.lines, index, 1) })}
                    isFirst={index === 0}
                    isLast={index === value.lines.length - 1}
                  />
                  <Stepper
                    value={line.reps}
                    min={line.metric === "TIME" ? 5 : 0}
                    max={line.maxReps}
                    suffix={line.metric === "TIME" ? "с" : undefined}
                    ariaLabel={line.label}
                    onChange={(reps) =>
                      onChange({
                        ...value,
                        lines: value.lines.map((item) => (item.exerciseId === line.exerciseId ? { ...item, reps } : item)),
                      })
                    }
                  />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
