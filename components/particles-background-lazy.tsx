"use client";

import dynamic from "next/dynamic";

const ParticlesBackground = dynamic(
  () => import("@/components/particles-background").then((module) => module.ParticlesBackground),
  { ssr: false },
);

export function ParticlesBackgroundLazy() {
  return <ParticlesBackground />;
}
