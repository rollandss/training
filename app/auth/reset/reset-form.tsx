"use client";

import { useActionState } from "react";
import Link from "next/link";

import { resetPasswordAction, type ResetFormState } from "@/app/auth/reset-actions";
import { MotionReveal } from "@/components/motion-ui";
import { PasswordInput } from "@/components/password-input";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, undefined as ResetFormState);

  if (state?.ok) {
    return (
      <MotionReveal>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Пароль змінено</CardTitle>
            <CardDescription>Тепер увійдіть із новим паролем.</CardDescription>
          </CardHeader>
          <CardFooter className="border-t-0 bg-transparent">
            <Link href="/auth/login" className={cn(buttonVariants(), "w-full sm:w-auto")}>
              Увійти
            </Link>
          </CardFooter>
        </Card>
      </MotionReveal>
    );
  }

  return (
    <MotionReveal>
      <Card className="w-full">
        <form action={formAction}>
          <input type="hidden" name="token" value={token} />
          <CardHeader>
            <CardTitle>Новий пароль</CardTitle>
            <CardDescription>Щонайменше 8 символів.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {state?.error ? (
              <p role="alert" className="text-sm text-destructive">
                {state.error}{" "}
                <Link href="/auth/forgot" className="font-bold underline underline-offset-4">
                  Запросити нове посилання
                </Link>
              </p>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="password">Новий пароль</Label>
              <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} required />
            </div>
          </CardContent>
          <CardFooter className="border-t-0 bg-transparent">
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Зберігаю...">
              Зберегти пароль
            </SubmitButton>
          </CardFooter>
        </form>
      </Card>
    </MotionReveal>
  );
}
