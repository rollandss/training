"use client";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

import { deleteAllPhotosAction, deletePhotoAction } from "./actions";

export function PhotoDeleteForm({ photoId }: { photoId: string }) {
  return (
    <form action={deletePhotoAction}>
      <input type="hidden" name="photoId" value={photoId} />
      <ConfirmSubmitButton variant="ghost" size="sm" confirmText="Видалити це фото назавжди?" pendingLabel="Видаляю…">
        Видалити
      </ConfirmSubmitButton>
    </form>
  );
}

export function DeleteAllPhotosForm() {
  return (
    <form action={deleteAllPhotosAction}>
      <ConfirmSubmitButton
        variant="destructive"
        confirmText="Видалити всі фото назавжди? Відновити їх не вийде."
        pendingLabel="Видаляю…"
      >
        Видалити всі фото
      </ConfirmSubmitButton>
    </form>
  );
}
