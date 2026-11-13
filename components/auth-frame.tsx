import Link from "next/link";

import { SiteLogo } from "@/components/site-logo";

/** Shared frame for login/register/forgot/reset/onboarding: logo on top, centered form, quiet back link. */
export function AuthFrame({ children, backHref = "/", backLabel = "На головну" }: { children: React.ReactNode; backHref?: string | null; backLabel?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <SiteLogo href="/" markClassName="h-11 w-auto" />
      <div className="mt-10 w-full max-w-md sm:mt-14">{children}</div>
      {backHref ? (
        <Link href={backHref} className="mt-8 text-sm font-bold underline decoration-2 underline-offset-4 hover:no-underline">
          {backLabel}
        </Link>
      ) : null}
    </div>
  );
}
