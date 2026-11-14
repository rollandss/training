"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { compressPhoto } from "@/lib/photos/compress";
import { PHOTO_KIND_LABEL, PHOTO_KINDS, type PhotoKind } from "@/lib/photos/rules";

import { createPhotoUploadAction, savePhotoAction } from "./actions";

const OPTIONS = PHOTO_KINDS.map((k) => ({ value: k, label: PHOTO_KIND_LABEL[k] }));

export function PhotoUploader({ defaultKind }: { defaultKind: PhotoKind }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [kind, setKind] = React.useState<PhotoKind>(defaultKind);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const busy = status !== null;

  async function upload(file: File) {
    setError(null);
    setDone(false);
    try {
      setStatus("Стискаю фото…");
      const photo = await compressPhoto(file);

      setStatus("Завантажую…");
      const ticket = await createPhotoUploadAction({ contentType: photo.contentType, bytes: photo.blob.size });
      if (!ticket.ok) throw new Error(ticket.error);
      const put = await fetch(ticket.url, {
        method: "PUT",
        headers: { "content-type": photo.contentType },
        body: photo.blob,
      });
      if (!put.ok) throw new Error("Сховище не прийняло файл. Спробуй ще раз.");

      setStatus("Зберігаю…");
      const saved = await savePhotoAction({ key: ticket.key, kind, width: photo.width, height: photo.height });
      if (!saved.ok) throw new Error(saved.error);
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Не вдалося обробити фото. Спробуй інше.");
    } finally {
      setStatus(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <SegmentedControl label="Тип фото" value={kind} options={OPTIONS} onChange={setKind} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Camera className="size-4" aria-hidden />
          {status ?? "Додати фото"}
        </Button>
        <span className="text-sm text-muted-foreground">Фото стискається на твоєму пристрої, дані про місце зйомки видаляються.</span>
      </div>
      {error ? <FormMessage>{error}</FormMessage> : null}
      {done ? <FormMessage tone="success">Фото збережено.</FormMessage> : null}
    </div>
  );
}
