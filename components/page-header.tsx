import * as React from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small line above the title, e.g. a breadcrumb or section name. */
  kicker?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  id?: string;
};

/** One page title style for the whole app: cabinet, admin, auth-free pages. */
export function PageHeader({ title, description, kicker, actions, className, id }: Props) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0">
        {kicker ? <div className="mb-2 text-sm font-bold">{kicker}</div> : null}
        <h1
          id={id}
          className="font-display text-[clamp(2rem,5.5vw,3.25rem)] font-black leading-[1.02] tracking-[-0.02em] break-words"
        >
          {title}
        </h1>
        {description ? <div className="mt-3 max-w-[62ch] text-base font-medium">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
