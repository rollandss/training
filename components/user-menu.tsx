"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings2 } from "lucide-react";

import { logoutAction } from "@/app/auth/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserInitials, getUserShortLabel } from "@/lib/user-display";
import { cn } from "@/lib/utils";

export function UserMenu({ email }: { email: string }) {
  const initials = getUserInitials(email);
  const shortLabel = getUserShortLabel(email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={email}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-auto max-w-none gap-2 px-2 py-1.5 text-left font-semibold normal-case tracking-normal shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[6px_6px_0px_0px_var(--color-border)]",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center border-2 border-border bg-primary text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[2px_2px_0px_0px_var(--color-border)]">
          {initials}
        </span>
        <span className="hidden min-w-0 max-w-[11rem] truncate sm:block">{shortLabel}</span>
        <ChevronDown className="hidden size-4 shrink-0 opacity-70 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 border-4 border-border p-2 shadow-[8px_8px_0px_0px_var(--color-border)]">
        <DropdownMenuLabel className="px-2 py-2">
          <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">Акаунт</div>
          <div className="mt-1 truncate text-sm font-semibold normal-case tracking-normal text-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border" />
        <DropdownMenuItem className="p-0">
          <Link
            href="/app/settings"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium"
          >
            <Settings2 className="size-4" />
            Налаштування
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer p-0">
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="size-4" />
              Вийти
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
