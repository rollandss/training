import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { PostBlock } from "@/lib/posts";

export const POSTS_CACHE_TAG = "daily-posts";

/**
 * Part of every cache key. The Vercel Data Cache survives deployments, while post
 * content can change at deploy time (scripts/sync-posts.ts runs in vercel-build),
 * so each deployment must start with its own post cache. Locally: per build.
 */
const CACHE_EPOCH = process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_BUILD_ID ?? "local";

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
  ["daily-post-catalog", CACHE_EPOCH],
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
    ["daily-post-block", block, CACHE_EPOCH],
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
    ["daily-post-slug", slug, CACHE_EPOCH],
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
    ["daily-post-day", String(dayNumber), CACHE_EPOCH],
    { tags: [POSTS_CACHE_TAG] },
  )();
}
