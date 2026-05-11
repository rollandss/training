"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction, type AuthFormState } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined as AuthFormState);

  return (
    <Card className="w-full max-w-md">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Вхід</CardTitle>
          <CardDescription>Введіть email і пароль.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <PasswordInput id="password" name="password" autoComplete="current-password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-transparent sm:flex-row sm:justify-between">
          <SubmitButton className="w-full sm:w-auto">Увійти</SubmitButton>
          <Link href="/auth/register" className={cn(buttonVariants({ variant: "ghost" }), "text-center text-sm")}>
            Реєстрація
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
