"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  isAdmin?: boolean;
};

const NAV_ITEMS = [
  { href: "/app", label: "Сьогодні" },
  { href: "/app/calendar", label: "Календар" },
  { href: "/app/posts", label: "Усі пости" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/post/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink(props: { href: string; label: string; onNavigate?: () => void; block?: boolean }) {
  const pathname = usePathname();
  const active = isNavActive(pathname, props.href);

  return (
    <Link
      href={props.href}
      onClick={props.onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-[var(--radius)] text-[15px] font-bold underline-offset-[6px] outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
        props.block ? "block border-4 border-transparent px-3 py-3" : "px-1 py-2",
        active ? "underline decoration-4" : "hover:underline hover:decoration-2",
        props.block && active && "border-border bg-primary no-underline",
      )}
    >
      {props.label}
    </Link>
  );
}

export function AppShell({ email, isAdmin }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const items = isAdmin ? [...NAV_ITEMS, { href: "/admin", label: "Адмінка" } as const] : NAV_ITEMS;

  return (
    <header className="border-b-4 border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 md:gap-8 md:px-8">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button type="button" variant="outline" size="icon-sm" className="md:hidden" aria-label="Відкрити меню">
                <Menu className="size-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[min(88vw,20rem)] border-r-4 border-border p-0">
            <SheetHeader className="border-b-4 border-border px-4 py-3 pr-14">
              <SheetTitle className="font-display text-left text-lg font-bold">Меню</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3 py-3" aria-label="Розділи">
              {items.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} onNavigate={closeMenu} block />
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <SiteLogo href="/app" onClick={closeMenu} markClassName="h-9 w-auto" />

        <nav className="hidden items-center gap-5 md:flex" aria-label="Розділи">
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
