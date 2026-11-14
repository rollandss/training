"use client";

import { useActionState } from "react";

import { onboardingAction, type OnboardingState } from "@/app/onboarding/actions";
import { MotionReveal } from "@/components/motion-ui";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { PULLUP_LEVELS } from "@/lib/levels";

const levels = PULLUP_LEVELS;

export function OnboardingForm() {
  const [state, formAction] = useActionState(onboardingAction, undefined as OnboardingState);

  return (
    <MotionReveal>
      <Card className="w-full">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Налаштуймо старт</CardTitle>
          <CardDescription>Два питання — і перший день програми відкриється одразу.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {state?.error ? (
            <FormMessage>{state.error}</FormMessage>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="levelSelfAssessment">Скільки разів ти зараз підтягуєшся?</Label>
            <NativeSelect id="levelSelfAssessment" name="levelSelfAssessment" required defaultValue="">
              <option value="" disabled>
                Обери варіант
              </option>
              {levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limitations">Обмеження / болючі зони (опційно)</Label>
            <Textarea
              id="limitations"
              name="limitations"
              rows={3}
              placeholder="Наприклад: лікті, поперек, коліна…"
            />
          </div>
          <div className="flex items-start gap-3 rounded-[var(--radius)] border-2 border-dashed border-border p-3">
            <span className="relative mt-0.5 flex size-5 shrink-0">
              <input
                id="tourConfirmed"
                name="tourConfirmed"
                type="checkbox"
                value="on"
                required
                className="peer size-5 cursor-pointer appearance-none rounded-[var(--radius)] border-2 border-border bg-input checked:bg-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
              />
              <Check className="pointer-events-none absolute inset-0 m-auto size-4 stroke-[3] opacity-0 peer-checked:opacity-100" aria-hidden />
            </span>
            <Label htmlFor="tourConfirmed" className="text-sm leading-snug font-normal">
              Маю надійно закріплений турнік і розумію: при болю зупиняюсь, а з травмами спершу раджусь з лікарем.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="border-t-0 bg-transparent">
          <SubmitButton className="w-full">Почати програму</SubmitButton>
        </CardFooter>
      </form>
    </Card>
    </MotionReveal>
  );
}
