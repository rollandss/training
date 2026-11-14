import Link from "next/link";

import { cn } from "@/lib/utils";

type Item = { href: string; label: string; active?: boolean };

/** Row of filter links (tabs). Same look wherever we switch between views of one list. */
export function SegmentedNav({ items, label, className }: { items: Item[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("-mx-1 overflow-x-auto px-1 pb-1", className)}>
      <ul className="flex w-max gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-[var(--radius)] border-2 border-border px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/50",
                item.active ? "bg-foreground text-background" : "bg-card hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
