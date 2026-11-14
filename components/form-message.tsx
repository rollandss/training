import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/** Inline result of a form submit. Errors are announced to screen readers. */
export function FormMessage({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-[var(--radius)] border-2 border-border px-3 py-2 text-sm font-medium",
        tone === "error" ? "bg-destructive/15" : "bg-primary",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
