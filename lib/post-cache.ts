import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { PostBlock } from "@/lib/posts";

export const POSTS_CACHE_TAG = "daily-posts";

const postCardSelect = {
  id: true,
  slug: true,
  titleUk: true,
  block: true,
  dayNumber: true,
  imageUrl: true,
  createdAt: true,
} as const;

const postDetailSelect = {
  ...postCardSelect,
  bodyUk: true,
} as const;

export type PostCardRecord = {
  id: string;
  slug: string;
  titleUk: string;
  block: string;
  dayNumber: number | null;
  imageUrl: string | null;
  createdAt: Date;
};

export type PostDetailRecord = PostCardRecord & {
  bodyUk: string;
};

export const getPostCatalogCached = unstable_cache(
  async (): Promise<PostCardRecord[]> =>
    prisma.dailyPost.findMany({
      select: postCardSelect,
      orderBy: [{ dayNumber: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
    }),
  ["daily-post-catalog"],
  { tags: [POSTS_CACHE_TAG] },
);

export function getPostsByBlockCached(block: PostBlock) {
  return unstable_cache(
    async (): Promise<PostCardRecord[]> =>
      prisma.dailyPost.findMany({
        where: { block },
        select: postCardSelect,
        orderBy: [{ dayNumber: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
      }),
    ["daily-post-block", block],
    { tags: [POSTS_CACHE_TAG] },
  )();
}

export function getPostBySlugCached(slug: string) {
  return unstable_cache(
    async (): Promise<PostDetailRecord | null> =>
      prisma.dailyPost.findUnique({
        where: { slug },
        select: postDetailSelect,
      }),
    ["daily-post-slug", slug],
    { tags: [POSTS_CACHE_TAG] },
  )();
}

export function getPostByDayCached(dayNumber: number) {
  return unstable_cache(
    async (): Promise<PostDetailRecord | null> =>
      prisma.dailyPost.findFirst({
        where: { dayNumber },
        select: postDetailSelect,
      }),
    ["daily-post-day", String(dayNumber)],
    { tags: [POSTS_CACHE_TAG] },
  )();
}
