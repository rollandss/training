import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 min-h-full">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-12 w-full max-w-[1400px] items-center justify-between gap-4 px-3 md:px-6">
          <nav className="flex gap-2 text-sm">
            <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Адмін
            </Link>
            <Link href="/admin/posts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Пости
            </Link>
          </nav>
          <Link href="/app" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Кабінет
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1400px] px-3 py-6 md:px-6">{children}</div>
    </div>
  );
}
