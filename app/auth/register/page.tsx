import Link from "next/link";

import { RegisterForm } from "@/app/auth/register/register-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <RegisterForm />
      <Link href="/" className={cn(buttonVariants({ variant: "link" }), "text-muted-foreground")}>
        На головну
      </Link>
    </div>
  );
}
