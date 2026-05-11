import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, type PostBlock } from "@/lib/posts";
import { cn } from "@/lib/utils";

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
    <div className="w-full overflow-x-auto">
      <div className="inline-flex min-w-full flex-wrap gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-2 shadow-[10px_10px_0px_0px_var(--color-border)]">
        <Link
          href={adminPostsHref(undefined, slug)}
          className={cn(
            buttonVariants({ size: "sm", variant: active === "ALL" ? "default" : "outline" }),
            "shrink-0",
          )}
        >
          Усі пости
        </Link>
        {POST_BLOCK_ORDER.map((block) => (
          <Link
            key={block}
            href={adminPostsHref(block, active === block ? slug : undefined)}
            className={cn(
              buttonVariants({ size: "sm", variant: active === block ? "default" : "outline" }),
              "shrink-0",
            )}
          >
            {POST_BLOCK_LABELS[block]}
          </Link>
        ))}
      </div>
    </div>
  );
}
