"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings2 } from "lucide-react";

import { logoutAction } from "@/app/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserInitials, getUserShortLabel } from "@/lib/user-display";
import { cn } from "@/lib/utils";

export function UserMenu({ email }: { email: string }) {
  const initials = getUserInitials(email);
  const shortLabel = getUserShortLabel(email);

  const handleLogout = () => {
    if (!window.confirm("Вийти з акаунту?")) return;
    void logoutAction();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        title={email}
        className={cn(
          "inline-flex h-9 max-w-[12rem] items-center gap-2 rounded-md px-1.5 text-left text-sm font-medium text-foreground",
          "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black uppercase tracking-wide text-primary-foreground">
          {initials}
        </span>
        <span className="hidden min-w-0 truncate sm:block">{shortLabel}</span>
        <ChevronDown className="hidden size-4 shrink-0 opacity-60 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="px-2 py-2">
          <div className="text-xs font-semibold text-muted-foreground">Акаунт</div>
          <div className="mt-1 truncate text-sm font-medium normal-case tracking-normal text-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLinkItem
          closeOnClick
          label="Налаштування"
          render={<Link href="/app/settings" />}
        >
          <Settings2 className="size-4" />
          Налаштування
        </DropdownMenuLinkItem>
        <DropdownMenuItem variant="destructive" label="Вийти" onClick={handleLogout}>
          <LogOut className="size-4" />
          Вийти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
