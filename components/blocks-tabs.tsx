import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { POST_BLOCK_LABELS, POST_BLOCK_ORDER, type PostBlock } from "@/lib/posts";
import { cn } from "@/lib/utils";

export function BlocksTabs({ active }: { active?: PostBlock | "ALL" }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-[var(--radius)] border-4 border-border bg-card p-2 shadow-[10px_10px_0px_0px_var(--color-border)]">
        <Link
          href="/app/posts"
          className={cn(
            buttonVariants({ size: "sm", variant: active === "ALL" ? "default" : "outline" }),
            "shrink-0",
          )}
        >
          Усі блоки
        </Link>
        {POST_BLOCK_ORDER.map((block) => (
          <Link
            key={block}
            href={`/app/posts/block/${block.toLowerCase()}`}
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

