"use client";

import * as React from "react";

type Side = { src: string; label: string };

/** Before/after overlay: drag the handle to reveal the second photo. */
export function CompareSlider({ before, after }: { before: Side; after: Side }) {
  const [pos, setPos] = React.useState(50);

  return (
    <figure className="space-y-3">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[var(--radius)] border-2 border-border bg-muted select-none">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URLs */}
        <img src={after.src} alt={after.label} className="absolute inset-0 size-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URLs */}
          <img src={before.src} alt={before.label} className="absolute inset-0 size-full object-cover" draggable={false} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-background shadow-[0_0_0_1px_var(--foreground)]" style={{ left: `${pos}%` }} />
        <span className="absolute top-2 left-2 rounded-[var(--radius)] bg-background/85 px-2 py-0.5 text-xs font-bold">{before.label}</span>
        <span className="absolute top-2 right-2 rounded-[var(--radius)] bg-background/85 px-2 py-0.5 text-xs font-bold">{after.label}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Порівняти фото"
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="text-center text-sm text-muted-foreground">Тягни вліво-вправо, щоб порівняти.</figcaption>
    </figure>
  );
}
