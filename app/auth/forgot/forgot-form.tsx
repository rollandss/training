"use client";

import { useActionState } from "react";
import Link from "next/link";

import { requestPasswordResetAction, type ResetFormState } from "@/app/auth/reset-actions";
import { MotionReveal } from "@/components/motion-ui";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ForgotForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, undefined as ResetFormState);

  return (
    <MotionReveal>
      <Card className="w-full">
        {state?.ok ? (
          <>
            <CardHeader>
              <CardTitle>Перевір пошту</CardTitle>
              <CardDescription>
                Якщо акаунт із цим email існує, ми надіслали посилання для нового пароля. Воно діє 1 годину. Не бачиш листа —
                зазирни в «Спам».
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t-0 bg-transparent">
              <Link href="/auth/login" className={cn(buttonVariants(), "w-full sm:w-auto")}>
                До входу
              </Link>
            </CardFooter>
          </>
        ) : (
          <form action={formAction}>
            <CardHeader>
              <CardTitle>Забув пароль?</CardTitle>
              <CardDescription>Вкажи email акаунта — надішлемо посилання, щоб задати новий пароль.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {state?.error ? (
                <FormMessage>{state.error}</FormMessage>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t-0 bg-transparent sm:flex-row sm:justify-between">
              <SubmitButton className="w-full sm:w-auto" pendingLabel="Надсилаю...">
                Надіслати посилання
              </SubmitButton>
              <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost" }), "text-center text-sm")}>
                Згадав пароль
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </MotionReveal>
  );
}
