"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { setupTelegramWebhookAction, type TelegramSetupState } from "./telegram-actions";

export function TelegramSetupCard({
  configured,
  username,
  webhookUrl,
  lastError,
}: {
  configured: boolean;
  username: string;
  webhookUrl: string | null;
  lastError: string | null;
}) {
  const [state, action] = useActionState<TelegramSetupState, FormData>(setupTelegramWebhookAction, undefined);

  let status: string;
  if (!configured) status = "Ключі бота не задані у змінних середовища.";
  else if (webhookUrl) status = `Підключено до ${webhookUrl}.`;
  else status = "Ключі є, але вебхук ще не зареєстровано — бот не отримує повідомлень.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram-бот</CardTitle>
        <CardDescription>
          {username ? `@${username}. ` : ""}
          {status}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lastError ? <FormMessage>Остання помилка Telegram: {lastError}</FormMessage> : null}
        {state?.error ? <FormMessage>{state.error}</FormMessage> : null}
        {state?.ok ? <FormMessage tone="success">{state.ok}</FormMessage> : null}
        <form action={action}>
          <SubmitButton disabled={!configured} pendingLabel="Підключаю…">
            {webhookUrl ? "Перепідключити вебхук" : "Підключити вебхук"}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
