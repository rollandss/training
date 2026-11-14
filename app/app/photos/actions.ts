"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  isOwnPhotoKey,
  parsePhotoKind,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_PER_USER,
  PHOTO_MAX_SIDE,
  photoExtension,
  photoKeyPrefix,
} from "@/lib/photos/rules";
import { prisma } from "@/lib/prisma";
import { getUserProgramState } from "@/lib/program-day";
import { deleteObject, headObject, presignUpload, r2Configured } from "@/lib/r2";

type Fail = { ok: false; error: string };

export type UploadTicket = { ok: true; key: string; url: string } | Fail;

export async function createPhotoUploadAction(input: { contentType: string; bytes: number }): Promise<UploadTicket> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Увійди, щоб додати фото." };
  if (!r2Configured()) return { ok: false, error: "Сховище фото ще не налаштоване." };

  const ext = photoExtension(input.contentType);
  if (!ext) return { ok: false, error: "Непідтримуваний формат." };
  if (!Number.isFinite(input.bytes) || input.bytes <= 0 || input.bytes > PHOTO_MAX_BYTES) {
    return { ok: false, error: "Файл завеликий навіть після стиснення." };
  }
  const count = await prisma.progressPhoto.count({ where: { userId: user.id } });
  if (count >= PHOTO_MAX_PER_USER) {
    return { ok: false, error: `Можна зберігати до ${PHOTO_MAX_PER_USER} фото. Видали зайві, щоб додати нове.` };
  }

  const key = `${photoKeyPrefix(user.id)}${randomUUID().replace(/-/g, "")}.${ext}`;
  // The upload URL is short-lived; type and size are verified again in savePhotoAction.
  const url = await presignUpload(key, input.contentType);
  return { ok: true, key, url };
}

export type SaveResult = { ok: true } | Fail;

export async function savePhotoAction(input: {
  key: string;
  kind: string;
  width: number;
  height: number;
}): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Увійди, щоб додати фото." };
  if (!isOwnPhotoKey(user.id, input.key)) return { ok: false, error: "Невірний файл." };
  const kind = parsePhotoKind(input.kind);
  if (!kind) return { ok: false, error: "Невірний тип фото." };
  const width = Math.round(input.width);
  const height = Math.round(input.height);
  if (!(width > 0 && height > 0 && width <= PHOTO_MAX_SIDE && height <= PHOTO_MAX_SIDE)) {
    return { ok: false, error: "Невірний розмір фото." };
  }

  const head = await headObject(input.key);
  if (!head) return { ok: false, error: "Файл не завантажився. Спробуй ще раз." };
  if (head.bytes > PHOTO_MAX_BYTES || photoExtension(head.contentType) !== input.key.split(".").pop()) {
    await deleteObject(input.key);
    return { ok: false, error: "Файл не пройшов перевірку. Спробуй ще раз." };
  }

  const state = await getUserProgramState(user.id);
  await prisma.progressPhoto.upsert({
    where: { key: input.key },
    create: { userId: user.id, key: input.key, kind, width, height, bytes: head.bytes, dayNumber: state?.day ?? null },
    update: {},
  });
  revalidatePath("/app/photos");
  return { ok: true };
}

export async function deletePhotoAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get("photoId") ?? "");
  const photo = await prisma.progressPhoto.findFirst({ where: { id, userId: user.id }, select: { id: true, key: true } });
  if (!photo) return;
  await deleteObject(photo.key);
  await prisma.progressPhoto.delete({ where: { id: photo.id } });
  revalidatePath("/app/photos");
}

export async function deleteAllPhotosAction() {
  const user = await getCurrentUser();
  if (!user) return;
  const photos = await prisma.progressPhoto.findMany({ where: { userId: user.id }, select: { key: true } });
  await Promise.all(photos.map((p) => deleteObject(p.key)));
  await prisma.progressPhoto.deleteMany({ where: { userId: user.id } });
  revalidatePath("/app/photos");
}
