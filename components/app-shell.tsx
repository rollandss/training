import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

type Props = {
  email: string;
  isAdmin?: boolean;
};

export function AppShell({ email, isAdmin }: Props) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/app" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stodenka-logo.svg" alt="Стоденка" className="h-7 w-auto" />
          </Link>
          <nav className="flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap pr-1 text-sm [-webkit-overflow-scrolling:touch]">
            <Link href="/app" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Пост дня
            </Link>
            <Link href="/app/posts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Пости
            </Link>
            <Link href="/app/calendar" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Календар
            </Link>
            <Link href="/app/settings" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Налаштування
            </Link>
            {isAdmin ? (
              <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Адмін
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
