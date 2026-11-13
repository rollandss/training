import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { AuthFrame } from "@/components/auth-frame";
import { getCurrentUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.profile?.onboardingDone) redirect("/app");

  return (
    <AuthFrame backHref={null}>
      <OnboardingForm />
    </AuthFrame>
  );
}
