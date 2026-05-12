"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";
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
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  return (
    <header className="border-b-4 border-border bg-card shadow-[0_6px_0px_0px_var(--color-border)]">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-2 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SiteLogo href="/app" onClick={closeMenu} showMobileLabel className="shrink-0" />

          <nav className="hidden items-center gap-2 md:flex">
            {NAV_ITEMS.map((item, index) => (
              <motion.div
                key={item.href}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <AppNavLink href={item.href} label={item.label} />
              </motion.div>
            ))}
            {isAdmin ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: NAV_ITEMS.length * 0.04 }}
              >
                <AppNavLink href="/admin" label="Адмін" />
              </motion.div>
            ) : null}
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
                <AnimatePresence initial={false}>
                  {menuOpen
                    ? NAV_ITEMS.map((item, index) => (
                        <motion.div
                          key={item.href}
                          initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                          transition={{ duration: 0.18, delay: index * 0.04 }}
                        >
                          <AppNavLink
                            href={item.href}
                            label={item.label}
                            onNavigate={closeMenu}
                            className="w-full"
                          />
                        </motion.div>
                      ))
                    : null}
                </AnimatePresence>
                {isAdmin && menuOpen ? (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                    transition={{ duration: 0.18, delay: NAV_ITEMS.length * 0.04 }}
                  >
                    <AppNavLink href="/admin" label="Адмін" onNavigate={closeMenu} className="w-full" />
                  </motion.div>
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
