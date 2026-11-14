"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ExerciseMark } from "@/components/exercise-mark";
import { ReorderButtons } from "@/components/reorder-buttons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";
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
  return metric === "TIME" ? "Ліміт лічильника, сек" : "Ліміт лічильника, повторів";
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
    <div className="grid gap-6">
      <ul className="grid gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {exercises.map((exercise, index) => (
            <motion.li
              key={exercise.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "rounded-[var(--radius)] border-2 border-border bg-card",
                !exercise.enabled && "bg-muted",
              )}
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <ExerciseMark className={cn(!exercise.enabled && "bg-muted text-muted-foreground")}>{exercise.short}</ExerciseMark>
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-sm font-bold", !exercise.enabled && "text-muted-foreground")}>
                    {exercise.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metricLabel(exercise.metric)} · ліміт {exercise.maxReps}
                    {exercise.metric === "TIME" ? " с" : ""}
                    {exercise.isBuiltin ? " · базова" : ""}
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
                  <Checkbox
                    checked={exercise.enabled}
                    disabled={togglingId === exercise.id}
                    onCheckedChange={(checked) => {
                      void toggleEnabled(exercise, checked === true);
                    }}
                    aria-label={`${exercise.label}: у тренуванні`}
                  />
                  <span className="hidden sm:inline">У тренуванні</span>
                </label>
                <ReorderButtons
                  label={exercise.label}
                  onUp={() => move(index, -1)}
                  onDown={() => move(index, 1)}
                  isFirst={index === 0}
                  isLast={index === exercises.length - 1}
                />
              </div>

              <details className="group border-t-2 border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-bold outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
                  Налаштувати
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <form
                  action={async (formData) => {
                    try {
                      await updateUserExerciseAction(formData);
                      toast.success("Вправу оновлено");
                    } catch {
                      toast.error("Не вдалося оновити вправу");
                    }
                  }}
                  className="grid gap-4 px-3 pb-4 pt-2"
                >
                  <input type="hidden" name="id" value={exercise.id} />
                  {exercise.isBuiltin ? (
                    <>
                      <input type="hidden" name="label" value={exercise.label} />
                      <input type="hidden" name="short" value={exercise.short} />
                      <input type="hidden" name="metric" value="REPS" />
                    </>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem_9rem]">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`exercise-label-${exercise.id}`}>Назва</Label>
                        <Input id={`exercise-label-${exercise.id}`} name="label" defaultValue={exercise.label} required />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`exercise-short-${exercise.id}`}>Коротко</Label>
                        <Input
                          id={`exercise-short-${exercise.id}`}
                          name="short"
                          defaultValue={exercise.short}
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`exercise-metric-${exercise.id}`}>Тип</Label>
                        <NativeSelect id={`exercise-metric-${exercise.id}`} name="metric" defaultValue={exercise.metric}>
                          <option value="REPS">Повтори</option>
                          <option value="TIME">Час</option>
                        </NativeSelect>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-1.5 sm:max-w-xs">
                    <Label htmlFor={`exercise-max-${exercise.id}`}>{maxFieldLabel(exercise.metric)}</Label>
                    <Input
                      id={`exercise-max-${exercise.id}`}
                      name="maxReps"
                      type="number"
                      min={1}
                      max={exercise.metric === "TIME" ? 3600 : 5000}
                      defaultValue={exercise.maxReps}
                      required
                      aria-describedby={`exercise-max-hint-${exercise.id}`}
                    />
                    <p id={`exercise-max-hint-${exercise.id}`} className="text-xs text-muted-foreground">
                      Більше цього числа на тренуванні ввести не вийде — захист від описок. Це не твій рекорд.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton size="sm" pendingLabel="Зберігаю...">
                      Зберегти
                    </SubmitButton>
                    {!exercise.isBuiltin ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm(`Видалити вправу «${exercise.label}»?`)) return;
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
                    ) : null}
                  </div>
                </form>
              </details>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <form
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
        className="grid gap-4 rounded-[var(--radius)] border-2 border-dashed border-border p-4"
      >
        <div className="font-display text-base font-bold">Нова вправа</div>
        <input type="hidden" name="metric" value={draftMetric} />
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Що рахуємо</span>
          <SegmentedControl
            label="Що рахуємо"
            value={draftMetric}
            onChange={setDraftMetric}
            options={[
              { value: "REPS", label: metricLabel("REPS") },
              { value: "TIME", label: metricLabel("TIME") },
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <div className="grid gap-1.5">
            <Label htmlFor="new-exercise-label">Назва</Label>
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
            <Label htmlFor="new-exercise-short">Коротко</Label>
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
        <SubmitButton className="w-fit" pendingLabel="Додаю..." disabled={!draftLabel.trim() || !draftShort.trim()}>
          <Plus className="size-4" />
          Додати вправу
        </SubmitButton>
      </form>
    </div>
  );
}
