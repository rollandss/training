"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu } from "lucide-react";

import { MotionPage } from "@/components/motion-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin", label: "Адмін" },
  { href: "/admin/users", label: "Користувачі" },
  { href: "/admin/posts", label: "Пости" },
  { href: "/admin/stats", label: "Статистика" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLink(props: { href: string; label: string; onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();
  const active = isNavActive(pathname, props.href);

  return (
    <Link
      href={props.href}
      onClick={props.onNavigate}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
        "border-4 border-border font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--color-border)]",
        props.className,
      )}
      aria-current={active ? "page" : undefined}
    >
      {props.label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  return (
    <motion.div className="min-h-full bg-muted/30">
      <header className="border-b-4 border-border bg-card shadow-[0_8px_0px_0px_var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-3 py-3 md:px-6">
          <nav className="hidden flex-wrap gap-2 md:flex">
            {NAV_LINKS.map((link, index) => (
              <motion.div
                key={link.href}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <AdminNavLink href={link.href} label={link.label} />
              </motion.div>
            ))}
          </nav>

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
                  <SheetTitle className="text-left text-base font-black uppercase tracking-wider">Адмін</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 px-4 py-4">
                  <AnimatePresence initial={false}>
                    {menuOpen
                      ? NAV_LINKS.map((link, index) => (
                          <motion.div
                            key={link.href}
                            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                            transition={{ duration: 0.18, delay: index * 0.04 }}
                          >
                            <AdminNavLink href={link.href} label={link.label} onNavigate={closeMenu} className="w-full" />
                          </motion.div>
                        ))
                      : null}
                  </AnimatePresence>
                </nav>
              </SheetContent>
            </Sheet>
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
        </div>
      </header>
      <MotionPage className="mx-auto w-full max-w-[1400px] space-y-6 px-3 py-6 md:px-6">{children}</MotionPage>
    </motion.div>
  );
}
