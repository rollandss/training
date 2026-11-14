"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerAction, type AuthFormState } from "@/app/auth/actions";
import { MotionReveal } from "@/components/motion-ui";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, undefined as AuthFormState);

  return (
    <MotionReveal>
      <Card className="w-full">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Реєстрація</CardTitle>
          <CardDescription>Мінімум 8 символів у паролі.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {state?.error ? <FormMessage>{state.error}</FormMessage> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <PasswordInput id="password" name="password" autoComplete="new-password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 border-t-0 bg-transparent">
          <SubmitButton className="h-12 w-full text-base">Створити акаунт</SubmitButton>
          <p className="text-center text-sm font-medium">
            Уже є акаунт?{" "}
            <Link href="/auth/login" className="font-bold underline decoration-2 underline-offset-4 hover:no-underline">
              Увійти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
    </MotionReveal>
  );
}
