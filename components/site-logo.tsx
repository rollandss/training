import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  href?: string;
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  showMobileLabel?: boolean;
  onClick?: () => void;
};

export function SiteLogo({
  href = "/",
  className,
  iconClassName,
  wordmarkClassName,
  showWordmark = true,
  showMobileLabel = false,
  onClick,
}: SiteLogoProps) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/stodenka-icon.svg" alt="" aria-hidden className={cn("size-10 shrink-0", iconClassName)} />
      {showWordmark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/stodenka-logo.svg"
          alt="Стоденка"
          className={cn("hidden h-9 w-auto sm:block", wordmarkClassName)}
        />
      ) : null}
      {showMobileLabel ? (
        <span className="text-base font-black uppercase tracking-wider sm:hidden">Стоденка</span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
  }

  return (
    <Link href={href} onClick={onClick} className={cn("flex items-center gap-3", className)}>
      {content}
    </Link>
  );
}
