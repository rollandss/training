"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PostCoverProps = {
  src: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
};

/**
 * Cover image that degrades to a styled placeholder when the URL is missing or fails
 * (hotlinked images disappear; a broken <img> left an empty box with the alt text over the badges).
 */
export function PostCover({ src, alt, className, fallbackLabel = "Матеріал дня" }: PostCoverProps) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-primary px-6 text-center text-sm font-black uppercase tracking-[0.2em] text-primary-foreground/70",
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
