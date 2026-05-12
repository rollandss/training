"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings2 } from "lucide-react";

import { logoutAction } from "@/app/auth/actions";
import { getUserInitials, getUserShortLabel } from "@/lib/user-display";
import { cn } from "@/lib/utils";

export function UserMenu({ email }: { email: string }) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const initials = getUserInitials(email);
  const shortLabel = getUserShortLabel(email);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    if (!window.confirm("Вийти з акаунту?")) return;
    await logoutAction();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        title={email}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-account-menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-9 max-w-[12rem] items-center gap-2 rounded-md px-1.5 text-left text-sm font-medium text-foreground",
          "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black uppercase tracking-wide text-primary-foreground">
          {initials}
        </span>
        <span className="hidden min-w-0 truncate sm:block">{shortLabel}</span>
        <ChevronDown className={cn("hidden size-4 shrink-0 opacity-60 transition-transform sm:block", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          id="user-account-menu"
          role="menu"
          aria-label="Меню акаунта"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-56 rounded-[var(--radius)] border-4 border-border bg-popover p-2 text-popover-foreground shadow-[8px_8px_0px_0px_var(--color-border)]"
        >
          <div className="border-b-4 border-border px-2 py-2">
            <div className="text-xs font-semibold text-muted-foreground">Акаунт</div>
            <div className="mt-1 truncate text-sm font-medium normal-case tracking-normal text-foreground">{email}</div>
          </div>

          <Link
            href="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Settings2 className="size-4" />
            Налаштування
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Вийти
          </button>
        </div>
      ) : null}
    </div>
  );
}
