"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PostCoverProps = {
  src: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  /** Render a hidden marker instead of the placeholder (parent can hide itself via :has([data-cover-failed])). */
  hideOnError?: boolean;
};

/**
 * Cover image that degrades to a styled placeholder when the URL is missing or fails
 * (hotlinked images disappear; a broken <img> left an empty box with the alt text over the badges).
 */
export function PostCover({ src, alt, className, fallbackLabel = "Матеріал дня", hideOnError }: PostCoverProps) {
  const [failed, setFailed] = React.useState(false);

  if (hideOnError && (!src || failed)) return <span data-cover-failed hidden />;
  if (!src || failed) {
    return (
      <div
        className={cn(
          "font-display flex h-full w-full items-center justify-center bg-muted px-6 text-center text-3xl font-black text-foreground/70 sm:text-5xl",
          "[background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] [background-size:var(--grid-cell)_var(--grid-cell)]",
          className,
        )}
        aria-hidden
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
