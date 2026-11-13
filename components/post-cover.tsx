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
          "flex h-full w-full items-center justify-center bg-primary px-6 text-center text-sm font-black text-primary-foreground/70",
          "bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1.5px)] [background-size:16px_16px]",
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
