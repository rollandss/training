"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction, type AuthFormState } from "@/app/auth/actions";
import { MotionReveal } from "@/components/motion-ui";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined as AuthFormState);

  return (
    <MotionReveal>
      <Card className="w-full">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Вхід</CardTitle>
          <CardDescription>З поверненням! Твій день уже чекає.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Link href="/auth/forgot" className="text-xs font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">
                Забули пароль?
              </Link>
            </div>
            <PasswordInput id="password" name="password" autoComplete="current-password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 border-t-0 bg-transparent">
          <SubmitButton className="h-12 w-full text-base">Увійти</SubmitButton>
          <p className="text-center text-sm font-medium">
            Ще немає акаунта?{" "}
            <Link href="/auth/register" className="font-bold underline decoration-2 underline-offset-4 hover:no-underline">
              Зареєструватися
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
    </MotionReveal>
  );
}
