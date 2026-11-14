"use client";

import * as React from "react";
import { toast } from "sonner";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SubmitButton } from "@/components/submit-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { createTelegramLinkAction, unlinkTelegramAction, updateTelegramPrefsAction } from "./actions";

type Props = {
  configured: boolean;
  link: { username: string | null; morningEnabled: boolean; eveningEnabled: boolean } | null;
};

export function TelegramCard({ configured, link }: Props) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  if (!configured) {
    return <p className="text-sm text-muted-foreground">Бот скоро запрацює.</p>;
  }

  if (!link) {
    return (
      <div className="grid gap-3">
        <p className="text-sm">
          Зранку — пост дня, увечері — кнопки, щоб відмітити день, не відкриваючи сайт.
        </p>
        {url ? (
          <div className="grid gap-2">
            <a href={url} target="_blank" rel="noreferrer" className={cn(buttonVariants(), "w-fit")}>
              Відкрити бота в Telegram
            </a>
            <p className="text-xs text-muted-foreground">
              Натисни «Start» у боті. Посилання діє 15 хвилин. Після підключення онови цю сторінку.
            </p>
          </div>
        ) : (
          <Button
            type="button"
            className="w-fit"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const res = await createTelegramLinkAction();
              setPending(false);
              if (res.ok) setUrl(res.url);
              else toast.error(res.error);
            }}
          >
            {pending ? "Готую посилання..." : "Підключити Telegram"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm">
        Підключено{link.username ? <> як <b>@{link.username}</b></> : null}.
      </p>
      <form action={updateTelegramPrefsAction} className="grid gap-3">
        <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-bold">
          <Checkbox name="morning" value="on" defaultChecked={link.morningEnabled} />
          Ранком — пост дня
        </label>
        <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-bold">
          <Checkbox name="evening" value="on" defaultChecked={link.eveningEnabled} />
          Увечері — нагадати відмітити день
        </label>
        <div className="flex flex-wrap gap-3">
          <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
            Зберегти
          </SubmitButton>
        </div>
      </form>
      <form action={unlinkTelegramAction}>
        <ConfirmSubmitButton variant="outline" size="sm" confirmText="Відʼєднати Telegram?" pendingLabel="Відʼєдную...">
          Відʼєднати
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
