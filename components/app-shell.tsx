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
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/app" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Пост дня
          </Link>
          <Link href="/app/posts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Пости
          </Link>
          {isAdmin ? (
            <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Адмін
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
