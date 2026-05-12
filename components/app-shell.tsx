"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  isAdmin?: boolean;
};

const NAV_ITEMS = [
  { href: "/app", label: "Пост дня" },
  { href: "/app/posts", label: "Пости" },
  { href: "/app/calendar", label: "Календар" },
  { href: "/app/settings", label: "Налаштування" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AppNavLink(props: { href: string; label: string; onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();
  const active = isNavActive(pathname, props.href);

  return (
    <Link
      href={props.href}
      onClick={props.onNavigate}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }),
        "justify-start font-black uppercase tracking-wider",
        props.className,
      )}
      aria-current={active ? "page" : undefined}
    >
      {props.label}
    </Link>
  );
}

export function AppShell({ email, isAdmin }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  return (
    <header className="border-b-4 border-border bg-card shadow-[0_6px_0px_0px_var(--color-border)]">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-2 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/app" className="flex shrink-0 items-center gap-2" onClick={closeMenu}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stodenka-icon.svg" alt="" aria-hidden className="size-9 shrink-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stodenka-logo.svg" alt="Стоденка" className="hidden h-8 w-auto sm:block" />
            <span className="text-base font-black uppercase tracking-wider sm:hidden">Стоденка</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item) => (
              <AppNavLink key={item.href} href={item.href} label={item.label} />
            ))}
            {isAdmin ? <AppNavLink href="/admin" label="Адмін" /> : null}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Відкрити меню"
                >
                  <Menu className="size-4" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-[min(88vw,20rem)] border-r-4 border-border p-0 shadow-[10px_10px_0px_0px_var(--color-border)]">
              <SheetHeader className="border-b-4 border-border px-4 py-3 pr-14">
                <SheetTitle className="text-left text-base font-black uppercase tracking-wider">Меню</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4 py-4">
                {NAV_ITEMS.map((item) => (
                  <AppNavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    onNavigate={closeMenu}
                    className="w-full"
                  />
                ))}
                {isAdmin ? (
                  <AppNavLink href="/admin" label="Адмін" onNavigate={closeMenu} className="w-full" />
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
