import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Flat block for grouping content *inside* a Card. No offset shadow, so cards
 * never stack shadow on shadow. Use `tone="accent"` for a highlighted summary.
 */
function Panel({
  className,
  tone = "muted",
  ...props
}: React.ComponentProps<"div"> & { tone?: "muted" | "plain" | "accent" | "dashed" }) {
  return (
    <div
      data-slot="panel"
      data-tone={tone}
      className={cn(
        "rounded-[var(--radius)] border-2 border-border p-4",
        tone === "muted" && "bg-muted",
        tone === "plain" && "bg-card",
        tone === "accent" && "bg-primary text-primary-foreground",
        tone === "dashed" && "border-dashed bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

/** Small uppercase-free caption used above a value inside a Panel. */
function PanelLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-label" className={cn("text-xs font-bold text-muted-foreground", className)} {...props} />;
}

export { Panel, PanelLabel };
