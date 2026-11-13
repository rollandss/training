import { redirect } from "next/navigation";

import { ResetForm } from "@/app/auth/reset/reset-form";
import { AuthFrame } from "@/components/auth-frame";

export const metadata = { title: "Новий пароль", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  if (!token) redirect("/auth/forgot");

  return (
    <AuthFrame backHref={null}>
      <ResetForm token={token} />
    </AuthFrame>
  );
}
