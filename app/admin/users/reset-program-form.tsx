"use client";

import { useRouter } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { resetUserProgramAction } from "./actions";
import { AdminMutationForm } from "./admin-mutation-form";

export function AdminResetProgramForm({ userId }: { userId: string }) {
  const router = useRouter();
  return (
    <AdminMutationForm
      action={resetUserProgramAction}
      successMessage="Програму скинуто на день 1."
      onSuccess={() => router.refresh()}
      className="flex flex-wrap items-center gap-3 border-t-2 border-border pt-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <ConfirmSubmitButton
        variant="outline"
        size="sm"
        confirmText="Скинути програму цього користувача на день 1? Його позначки календаря і записи тренувань буде видалено."
        pendingLabel="Скидаю..."
      >
        Почати програму заново
      </ConfirmSubmitButton>
      <span className="text-xs text-muted-foreground">Позначки й тренування видаляються, максимуми лишаються.</span>
    </AdminMutationForm>
  );
}
