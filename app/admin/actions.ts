"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { postBodyToPlainText } from "@/lib/post-text";
import { POST_BLOCKS } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

function revalidatePostsSurfaces() {
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/new");
  revalidatePath("/app/posts");
  revalidatePath("/app");
  for (const block of POST_BLOCKS) {
    revalidatePath(`/app/posts/block/${block.toLowerCase()}`);
  }
}

function parsePostBody(formData: FormData) {
  const bodyUk = String(formData.get("bodyUk") ?? "").trim();
  if (!postBodyToPlainText(bodyUk)) return "";
  return bodyUk;
}

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/app");

  const slug = String(formData.get("slug") ?? "").trim();
  const titleUk = String(formData.get("titleUk") ?? "").trim();
  const bodyUk = parsePostBody(formData);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const block = String(formData.get("block") ?? "").trim().toUpperCase();
  const dayRaw = String(formData.get("dayNumber") ?? "").trim();
  const dayNumber = dayRaw ? Number(dayRaw) : null;

  if (!slug || !titleUk || !bodyUk) return;
  if (!POST_BLOCKS.includes(block as (typeof POST_BLOCKS)[number])) return;
  if (dayNumber !== null && (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 100)) return;

  await prisma.dailyPost.create({
    data: {
      slug,
      titleUk,
      bodyUk,
      imageUrl: imageUrl || null,
      block,
      dayNumber,
    },
  });

  revalidatePostsSurfaces();
  redirect(`/admin/posts?block=${block.toLowerCase()}&slug=${encodeURIComponent(slug)}`);
}

export async function updatePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/app");

  const id = String(formData.get("id") ?? "").trim();
  const titleUk = String(formData.get("titleUk") ?? "").trim();
  const bodyUk = parsePostBody(formData);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const block = String(formData.get("block") ?? "").trim().toUpperCase();
  const dayRaw = String(formData.get("dayNumber") ?? "").trim();
  const dayNumber = dayRaw ? Number(dayRaw) : null;
  if (!id || !titleUk || !bodyUk) return;
  if (!POST_BLOCKS.includes(block as (typeof POST_BLOCKS)[number])) return;
  if (dayNumber !== null && (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 100)) return;

  await prisma.dailyPost.update({
    where: { id },
    data: {
      titleUk,
      bodyUk,
      imageUrl: imageUrl || null,
      block,
      dayNumber,
    },
  });

  revalidatePostsSurfaces();
}

export async function deletePostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/app");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.dailyPost.delete({ where: { id } });
  revalidatePostsSurfaces();
}
