"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

const flat = "border-2 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0";

/** Up/down pair for reordering a list item. */
export function ReorderButtons(props: {
  label: string;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  direction?: "row" | "column";
}) {
  const { label, onUp, onDown, isFirst, isLast, direction = "row" } = props;
  return (
    <div className={direction === "row" ? "flex shrink-0 gap-1" : "flex shrink-0 flex-col gap-1"}>
      <Button type="button" variant="outline" size="icon-sm" className={flat} onClick={onUp} disabled={isFirst} aria-label={`${label}: вище`}>
        <ArrowUp className="size-4" />
      </Button>
      <Button type="button" variant="outline" size="icon-sm" className={flat} onClick={onDown} disabled={isLast} aria-label={`${label}: нижче`}>
        <ArrowDown className="size-4" />
      </Button>
    </div>
  );
}
