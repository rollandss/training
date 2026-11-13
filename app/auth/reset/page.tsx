import { redirect } from "next/navigation";

import { ResetForm } from "@/app/auth/reset/reset-form";

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
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <ResetForm token={token} />
    </div>
  );
}
