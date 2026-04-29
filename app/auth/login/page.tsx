import Link from "next/link";

import { LoginForm } from "@/app/auth/login/login-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LoginForm />
      <Link href="/" className={cn(buttonVariants({ variant: "link" }), "text-muted-foreground")}>
        На головну
      </Link>
    </div>
  );
}
