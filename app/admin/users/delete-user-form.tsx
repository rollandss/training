"use client";

import { useRouter } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { deleteUserAction } from "./actions";
import { AdminMutationForm } from "./admin-mutation-form";

export function AdminDeleteUserForm({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const router = useRouter();

  return (
    <AdminMutationForm
      action={deleteUserAction}
      successMessage="Користувача видалено."
      onSuccess={() => router.push("/admin/users")}
    >
      <input type="hidden" name="userId" value={userId} />
      <ConfirmSubmitButton
        confirmText="Видалити користувача і весь його прогрес? Це не можна скасувати."
        type="submit"
        variant="destructive" className="w-fit" disabled={disabled} pendingLabel="Видаляю...">
        Видалити користувача
      </ConfirmSubmitButton>
    </AdminMutationForm>
  );
}
