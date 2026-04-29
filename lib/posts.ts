export const POST_BLOCKS = ["PREPARATION", "BASIC", "ADVANCED", "TURBO", "CONCLUSION"] as const;
export const POST_BLOCK_ORDER: PostBlock[] = ["PREPARATION", "BASIC", "ADVANCED", "TURBO", "CONCLUSION"];

export type PostBlock = (typeof POST_BLOCKS)[number];

export const POST_BLOCK_LABELS: Record<PostBlock, string> = {
  PREPARATION: "Підготовка",
  BASIC: "Базовий",
  ADVANCED: "Просунутий",
  TURBO: "Турбо блок",
  CONCLUSION: "Заключення",
};

export function getPostBlockLabel(block: string) {
  return POST_BLOCK_LABELS[(block as PostBlock) ?? "PREPARATION"] ?? block;
}

export function getPostBlockSlug(block: PostBlock) {
  return block.toLowerCase();
}

export function parsePostBlockSlug(slug: string): PostBlock | null {
  const normalized = slug.trim().toUpperCase();
  if (POST_BLOCKS.includes(normalized as PostBlock)) return normalized as PostBlock;
  return null;
}
