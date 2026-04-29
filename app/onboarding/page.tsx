import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { getCurrentUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.profile?.onboardingDone) redirect("/app");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <OnboardingForm />
    </div>
  );
}
