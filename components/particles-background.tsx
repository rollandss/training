"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = () => onStoreChange();
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    },
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false,
  );
}

export function ParticlesBackground() {
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setReady(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 110, density: { enable: true, area: 900 } },
        color: { value: isDark ? "#FFFFFF" : "#0A0A0A" },
        opacity: {
          value: isDark ? { min: 0.22, max: 0.75 } : { min: 0.18, max: 0.65 },
          animation: { enable: !reduced, speed: 0.6, minimumValue: 0.12, sync: false },
        },
        size: {
          value: { min: 1, max: 5 },
          animation: { enable: !reduced, speed: 2.0, minimumValue: 0.8, sync: false },
        },
        move: {
          enable: !reduced,
          speed: 1.35,
          direction: "none",
          outModes: { default: "bounce" },
          random: true,
        },
        links: { enable: false },
      },
      interactivity: {
        events: {
          onHover: { enable: !reduced, mode: ["repulse"] },
          onClick: { enable: false, mode: [] },
          resize: { enable: true },
        },
        modes: {
          repulse: { distance: 120, duration: 0.35 },
        },
      },
    }),
    [isDark, reduced],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] mix-blend-multiply">
      {ready ? (
        <Particles
          id="nb-particles"
          options={options}
          className="h-full w-full"
        />
      ) : null}
    </div>
  );
}

