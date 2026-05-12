"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      const handler = () => onStoreChange();
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    },
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function ParticlesBackground() {
  const reduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (reduced || isMobile) return;

    let cancelled = false;
    const start = () => {
      initParticlesEngine(async (engine) => {
        await loadFull(engine);
      }).then(() => {
        if (!cancelled) setReady(true);
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(start, { timeout: 1500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = globalThis.setTimeout(start, 0);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [isMobile, reduced]);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 45,
      detectRetina: true,
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 72, density: { enable: true, area: 1100 } },
        color: { value: isDark ? "#FFFFFF" : "#0A0A0A" },
        opacity: {
          value: isDark ? { min: 0.3, max: 0.9 } : { min: 0.18, max: 0.65 },
          animation: { enable: !reduced, speed: 0.6, minimumValue: 0.12, sync: false },
        },
        size: {
          value: { min: 1, max: 4 },
          animation: { enable: !reduced, speed: 1.6, minimumValue: 0.8, sync: false },
        },
        move: {
          enable: !reduced,
          speed: 1.1,
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
          repulse: { distance: 100, duration: 0.3 },
        },
      },
    }),
    [isDark, reduced],
  );

  if (reduced || isMobile || !ready) {
    return null;
  }

  return (
    <div className={["pointer-events-none fixed inset-0 z-[1]", isDark ? "mix-blend-screen" : "mix-blend-multiply"].join(" ")}>
      <Particles id="nb-particles" options={options} className="h-full w-full" />
    </div>
  );
}
