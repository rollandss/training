import Link from "next/link";

import { ForgotForm } from "@/app/auth/forgot/forgot-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Відновлення пароля" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <ForgotForm />
      <Link href="/" className={cn(buttonVariants({ variant: "link" }), "text-muted-foreground")}>
        На головну
      </Link>
    </div>
  );
}
