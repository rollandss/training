"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
