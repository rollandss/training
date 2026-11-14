import { SegmentedNav } from "@/components/segmented-nav";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, type PostBlock } from "@/lib/posts";

type Props = {
  active?: PostBlock | "ALL";
  slug?: string;
};

function adminPostsHref(block?: PostBlock, slug?: string) {
  const params = new URLSearchParams();
  if (block) params.set("block", block.toLowerCase());
  if (slug) params.set("slug", slug);
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export function AdminPostsTabs({ active = "ALL", slug }: Props) {
  return (
    <SegmentedNav
      label="Блоки постів"
      items={[
        { href: adminPostsHref(undefined, slug), label: "Усі", active: active === "ALL" },
        ...POST_BLOCK_ORDER.map((block) => ({
          href: adminPostsHref(block, active === block ? slug : undefined),
          label: POST_BLOCK_LABELS[block],
          active: active === block,
        })),
      ]}
    />
  );
}
