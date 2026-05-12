import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin", label: "Адмін" },
  { href: "/admin/users", label: "Користувачі" },
  { href: "/admin/posts", label: "Пости" },
  { href: "/admin/stats", label: "Статистика" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-muted/30">
      <header className="border-b-4 border-border bg-card shadow-[0_8px_0px_0px_var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <nav className="flex flex-wrap gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-4 border-border font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--color-border)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/app"
            className={cn(
              buttonVariants({ size: "sm" }),
              "border-4 border-border font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)]",
            )}
          >
            Кабінет
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-3 py-6 md:px-6">{children}</div>
    </div>
  );
}
