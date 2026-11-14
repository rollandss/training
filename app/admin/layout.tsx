import { redirect } from "next/navigation";

import { AppMain } from "@/components/app-main";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/app");

  return (
    <div className="flex min-h-full flex-col">
      <AppShell email={user.email} isAdmin section="admin" />
      <AppMain>{children}</AppMain>
    </div>
  );
}
