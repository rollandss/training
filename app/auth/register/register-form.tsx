"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerAction, type AuthFormState } from "@/app/auth/actions";
import { MotionReveal } from "@/components/motion-ui";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, undefined as AuthFormState);

  return (
    <MotionReveal>
      <Card className="w-full max-w-md">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Реєстрація</CardTitle>
          <CardDescription>Мінімум 8 символів у паролі.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <PasswordInput id="password" name="password" autoComplete="new-password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-transparent sm:flex-row sm:justify-between">
          <SubmitButton className="w-full sm:w-auto">Створити акаунт</SubmitButton>
          <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost" }), "text-center text-sm")}>
            Уже є акаунт
          </Link>
        </CardFooter>
      </form>
    </Card>
    </MotionReveal>
  );
}
