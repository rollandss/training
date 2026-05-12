import { redirect } from "next/navigation";

import { AppMain } from "@/components/app-main";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!user.profile?.onboardingDone) redirect("/onboarding");
  if (!user.userPrograms[0]) redirect("/onboarding");

  return (
    <div className="flex min-h-full flex-col">
      <AppShell email={user.email} isAdmin={user.role === "ADMIN"} />
      <AppMain>{children}</AppMain>
    </div>
  );
}
