"use client";

import { MotionPage } from "@/components/motion-ui";

export function AppMain({ children }: { children: React.ReactNode }) {
  return <MotionPage className="mx-auto w-full flex-1 px-3 py-6 md:px-6">{children}</MotionPage>;
}
