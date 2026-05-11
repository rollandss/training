"use client";

import { useRouter } from "next/navigation";

import { SubmitButton } from "@/components/submit-button";

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
      <SubmitButton type="submit" variant="destructive" className="w-fit" disabled={disabled} pendingLabel="Видаляю...">
        Видалити користувача
      </SubmitButton>
    </AdminMutationForm>
  );
}
