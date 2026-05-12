"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ExerciseMetric, type UserExerciseView } from "@/lib/user-exercise-utils";
import { cn } from "@/lib/utils";

import {
  createUserExerciseAction,
  deleteUserExerciseAction,
  reorderUserExercisesAction,
  setUserExerciseEnabledAction,
  updateUserExerciseAction,
} from "./actions";

function moveExercise(exercises: UserExerciseView[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= exercises.length) return exercises;
  const next = [...exercises];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function metricLabel(metric: ExerciseMetric) {
  return metric === "TIME" ? "Час" : "Повтори";
}

function maxFieldLabel(metric: ExerciseMetric) {
  return metric === "TIME" ? "Максимум секунд" : "Максимум повторень";
}

export function UserExercisesForm(props: { initial: UserExerciseView[] }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [exercises, setExercises] = React.useState(props.initial);
  const [draftLabel, setDraftLabel] = React.useState("");
  const [draftShort, setDraftShort] = React.useState("");
  const [draftMetric, setDraftMetric] = React.useState<ExerciseMetric>("REPS");
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const persistOrder = React.useCallback(async (ordered: UserExerciseView[]) => {
    const formData = new FormData();
    formData.set("orderedIds", JSON.stringify(ordered.map((exercise) => exercise.id)));
    try {
      await reorderUserExercisesAction(formData);
      toast.success("Порядок збережено");
    } catch {
      toast.error("Не вдалося зберегти порядок");
      setExercises(props.initial);
    }
  }, [props.initial]);

  const move = React.useCallback(
    (index: number, direction: -1 | 1) => {
      setExercises((current) => {
        const next = moveExercise(current, index, direction);
        void persistOrder(next);
        return next;
      });
    },
    [persistOrder],
  );

  const toggleEnabled = React.useCallback(
    async (exercise: UserExerciseView, enabled: boolean) => {
      setTogglingId(exercise.id);
      setExercises((current) =>
        current.map((item) => (item.id === exercise.id ? { ...item, enabled } : item)),
      );

      const formData = new FormData();
      formData.set("id", exercise.id);
      formData.set("enabled", String(enabled));

      try {
        await setUserExerciseEnabledAction(formData);
        toast.success(enabled ? "Вправу увімкнено" : "Вправу вимкнено");
        router.refresh();
      } catch {
        setExercises((current) =>
          current.map((item) => (item.id === exercise.id ? { ...item, enabled: exercise.enabled } : item)),
        );
        toast.error(
          enabled
            ? "Не вдалося увімкнути вправу"
            : "Не вдалося вимкнути вправу. Має лишитися хоча б одна активна вправа.",
        );
      } finally {
        setTogglingId(null);
      }
    },
    [router],
  );

  return (
    <div className="grid gap-4">
      <AnimatePresence initial={false} mode="popLayout">
        {exercises.map((exercise, index) => (
          <motion.form
            key={exercise.id}
            layout
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            action={async (formData) => {
              try {
                await updateUserExerciseAction(formData);
                toast.success("Вправу оновлено");
              } catch {
                toast.error("Не вдалося оновити вправу");
              }
            }}
            className={cn(
              "grid gap-3 rounded-[var(--radius)] border-4 border-border bg-card p-3 shadow-[6px_6px_0px_0px_var(--color-border)]",
              !exercise.enabled && "opacity-80",
            )}
          >
            <input type="hidden" name="id" value={exercise.id} />
            <motion.div layout className="flex flex-wrap items-center gap-2">
              <Checkbox
                id={`exercise-enabled-${exercise.id}`}
                checked={exercise.enabled}
                disabled={togglingId === exercise.id}
                onCheckedChange={(checked) => {
                  void toggleEnabled(exercise, checked === true);
                }}
              />
              <Label
                htmlFor={`exercise-enabled-${exercise.id}`}
                className="text-xs font-black uppercase tracking-wider"
              >
                У тренуванні
              </Label>
              {!exercise.enabled ? (
                <span className="text-xs font-semibold text-muted-foreground">Вимкнено</span>
              ) : null}
            </motion.div>
            <div className="flex items-start gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-secondary text-sm font-black shadow-[4px_4px_0px_0px_var(--color-border)]">
                {exercise.short}
              </div>
              <motion.div layout className="min-w-0 flex-1 grid gap-2 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor={`exercise-label-${exercise.id}`} className="text-xs">
                    Назва
                  </Label>
                  <Input
                    id={`exercise-label-${exercise.id}`}
                    name="label"
                    defaultValue={exercise.label}
                    required
                    disabled={exercise.isBuiltin}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`exercise-short-${exercise.id}`} className="text-xs">
                    Коротко
                  </Label>
                  <Input
                    id={`exercise-short-${exercise.id}`}
                    name="short"
                    defaultValue={exercise.short}
                    maxLength={6}
                    required
                    disabled={exercise.isBuiltin}
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor={`exercise-max-${exercise.id}`} className="text-xs">
                    {maxFieldLabel(exercise.metric)}
                  </Label>
                  <Input
                    id={`exercise-max-${exercise.id}`}
                    name="maxReps"
                    type="number"
                    min={1}
                    max={exercise.metric === "TIME" ? 3600 : 5000}
                    defaultValue={exercise.maxReps}
                    required
                  />
                </div>
                {!exercise.isBuiltin ? (
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor={`exercise-metric-${exercise.id}`} className="text-xs">
                      Тип
                    </Label>
                    <select
                      id={`exercise-metric-${exercise.id}`}
                      name="metric"
                      defaultValue={exercise.metric}
                      className="h-9 rounded-[var(--radius)] border-4 border-border bg-background px-3 text-sm font-semibold shadow-[4px_4px_0px_0px_var(--color-border)]"
                    >
                      <option value="REPS">Повтори</option>
                      <option value="TIME">Час</option>
                    </select>
                  </div>
                ) : (
                  <input type="hidden" name="metric" value="REPS" />
                )}
              </motion.div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background shadow-[3px_3px_0px_0px_var(--color-border)] disabled:opacity-40"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`${exercise.label}: вгору`}
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-[var(--radius)] border-4 border-border bg-background shadow-[3px_3px_0px_0px_var(--color-border)] disabled:opacity-40"
                  onClick={() => move(index, 1)}
                  disabled={index === exercises.length - 1}
                  aria-label={`${exercise.label}: вниз`}
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton size="sm" pendingLabel="Зберігаю...">
                Зберегти
              </SubmitButton>
              {!exercise.isBuiltin ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="font-black uppercase tracking-wider"
                  onClick={async () => {
                    const formData = new FormData();
                    formData.set("id", exercise.id);
                    try {
                      await deleteUserExerciseAction(formData);
                      toast.success("Вправу видалено");
                    } catch {
                      toast.error("Не вдалося видалити вправу");
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                  Видалити
                </Button>
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">Базова вправа</span>
              )}
            </div>
          </motion.form>
        ))}
      </AnimatePresence>

      <motion.form
        layout
        action={async (formData) => {
          try {
            await createUserExerciseAction(formData);
            toast.success("Вправу додано");
            setDraftLabel("");
            setDraftShort("");
          } catch {
            toast.error("Не вдалося додати вправу");
          }
        }}
        className="grid gap-3 rounded-[var(--radius)] border-4 border-dashed border-border bg-background/80 p-3 shadow-[6px_6px_0px_0px_var(--color-border)]"
      >
        <div className="text-sm font-black">Нова вправа</div>
        <input type="hidden" name="metric" value={draftMetric} />
        <div className="grid grid-cols-2 gap-2">
          {(["REPS", "TIME"] as const).map((metric) => (
            <button
              key={metric}
              type="button"
              onClick={() => setDraftMetric(metric)}
              className={cn(
                "rounded-[var(--radius)] border-4 border-border px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)]",
                draftMetric === metric ? "bg-primary text-primary-foreground" : "bg-background",
              )}
              aria-pressed={draftMetric === metric}
            >
              {metricLabel(metric)}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="new-exercise-label" className="text-xs">
              Назва
            </Label>
            <Input
              id="new-exercise-label"
              name="label"
              value={draftLabel}
              onChange={(event) => setDraftLabel(event.target.value)}
              placeholder="Напр.: планка"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-exercise-short" className="text-xs">
              Коротко
            </Label>
            <Input
              id="new-exercise-short"
              name="short"
              value={draftShort}
              onChange={(event) => setDraftShort(event.target.value)}
              placeholder="Пл"
              maxLength={6}
              required
            />
          </div>
        </div>
        <SubmitButton
          className={cn("w-fit")}
          pendingLabel="Додаю..."
          disabled={!draftLabel.trim() || !draftShort.trim()}
        >
          <Plus className="size-4" />
          Додати вправу
        </SubmitButton>
      </motion.form>
    </div>
  );
}
