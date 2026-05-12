import Link from "next/link";

import { StodenkaLogoMark } from "@/components/stodenka-logo-mark";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  href?: string;
  className?: string;
  markClassName?: string;
  centered?: boolean;
  onClick?: () => void;
};

export function SiteLogo({ href = "/", className, markClassName, centered = false, onClick }: SiteLogoProps) {
  const mark = <StodenkaLogoMark className={markClassName} />;

  if (!href) {
    return <div className={cn("flex items-center", centered && "justify-center", className)}>{mark}</div>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("flex items-center", centered && "justify-center", className)}
    >
      {mark}
    </Link>
  );
}
