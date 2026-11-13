"use client";

import { useActionState } from "react";

import { onboardingAction, type OnboardingState } from "@/app/onboarding/actions";
import { MotionReveal } from "@/components/motion-ui";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const levels = [
  { value: "novice", label: "Жодного — я новачок" },
  { value: "basic", label: "1–5 разів" },
  { value: "intermediate", label: "6–12 разів" },
  { value: "advanced", label: "Більше 12" },
];

export function OnboardingForm() {
  const [state, formAction] = useActionState(onboardingAction, undefined as OnboardingState);

  return (
    <MotionReveal>
      <Card className="w-full max-w-lg">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Налаштуймо старт</CardTitle>
          <CardDescription>Два питання — і перший день програми відкриється одразу.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {state?.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="levelSelfAssessment">Скільки разів ви зараз підтягуєтесь?</Label>
            <NativeSelect id="levelSelfAssessment" name="levelSelfAssessment" required defaultValue="">
              <option value="" disabled>
                Оберіть варіант
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
          <div className="flex items-start gap-3 rounded-[var(--radius)] border-4 border-dashed border-border bg-background p-3">
            <input
              id="tourConfirmed"
              name="tourConfirmed"
              type="checkbox"
              value="on"
              required
              className="mt-0.5 size-5 shrink-0 accent-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
            />
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
