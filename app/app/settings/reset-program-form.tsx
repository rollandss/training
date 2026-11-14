"use client";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { resetMyProgramAction } from "./actions";

export function ResetProgramForm() {
  return (
    <form action={resetMyProgramAction}>
      <ConfirmSubmitButton
        variant="destructive"
        confirmText="Почати програму з першого дня? Усі позначки календаря і записи тренувань буде видалено. Це не можна скасувати."
        pendingLabel="Скидаю..."
      >
        Почати заново
      </ConfirmSubmitButton>
    </form>
  );
}
