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
  /** Which navigation set to show. The header itself is the same everywhere. */
  section?: "app" | "admin";
};

type NavItem = { href: string; label: string };

const APP_NAV: NavItem[] = [
  { href: "/app", label: "Сьогодні" },
  { href: "/app/calendar", label: "Календар" },
  { href: "/app/posts", label: "Усі пости" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Огляд" },
  { href: "/admin/users", label: "Користувачі" },
  { href: "/admin/posts", label: "Пости" },
  { href: "/admin/stats", label: "Статистика" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app" || pathname.startsWith("/app/post/");
  if (href === "/admin") return pathname === "/admin";
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
        "rounded-[var(--radius)] text-[15px] font-semibold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/40",
        props.block ? "block px-3 py-2.5" : "px-1 py-1.5",
        active ? "nb-highlight text-foreground" : "text-muted-foreground hover:text-foreground",
        props.block && active && "bg-primary/60 no-underline",
      )}
    >
      {props.label}
    </Link>
  );
}

export function AppShell({ email, isAdmin, section = "app" }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);
  const items: NavItem[] =
    section === "admin"
      ? [...ADMIN_NAV, { href: "/app", label: "Кабінет" }]
      : isAdmin
        ? [...APP_NAV, { href: "/admin", label: "Адмінка" }]
        : APP_NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-border/15 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 md:gap-10 md:px-8">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button type="button" variant="ghost" size="icon-sm" className="md:hidden" aria-label="Відкрити меню">
                <Menu className="size-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[min(88vw,20rem)] border-r border-border/20 bg-background p-0">
            <SheetHeader className="border-b border-border/15 px-4 py-3 pr-14">
              <SheetTitle className="font-display text-left text-lg font-bold">Меню</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3 py-3" aria-label="Розділи">
              {items.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} onNavigate={closeMenu} block />
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3">
          <SiteLogo href={section === "admin" ? "/admin" : "/app"} onClick={closeMenu} markClassName="h-8 w-auto" />
          {section === "admin" ? (
            <span className="rounded-[var(--radius)] bg-secondary px-1.5 py-0.5 text-xs font-bold text-secondary-foreground">
              адмінка
            </span>
          ) : null}
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Розділи">
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
