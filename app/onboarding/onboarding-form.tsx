"use client";

import { useActionState } from "react";

import { onboardingAction, type OnboardingState } from "@/app/onboarding/actions";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const levels = [
  { value: "novice", label: "Новачок (мало досвіду з турніком)" },
  { value: "basic", label: "Базовий (1–5 підтягувань)" },
  { value: "intermediate", label: "Середній (6–12 підтягувань)" },
  { value: "advanced", label: "Вище середнього (12+ підтягувань)" },
];

export function OnboardingForm() {
  const [state, formAction] = useActionState(onboardingAction, undefined as OnboardingState);

  return (
    <Card className="w-full max-w-lg">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Онбординг</CardTitle>
          <CardDescription>Кілька питань перед стартом програми «100 днів».</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <div className="grid gap-2">
            <Label htmlFor="levelSelfAssessment">Ваш рівень</Label>
            <select
              id="levelSelfAssessment"
              name="levelSelfAssessment"
              required
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              defaultValue=""
            >
              <option value="" disabled>
                Оберіть варіант
              </option>
              {levels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
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
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <input
              id="tourConfirmed"
              name="tourConfirmed"
              type="checkbox"
              value="on"
              required
              className="border-input text-primary focus-visible:ring-ring mt-1 size-4 shrink-0 rounded border shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <Label htmlFor="tourConfirmed" className="text-sm leading-snug font-normal">
              Підтверджую, що маю стабільний турнік для тренувань і згоден з рекомендаціями безпеки.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-transparent">
          <SubmitButton className="w-full">Почати програму</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
