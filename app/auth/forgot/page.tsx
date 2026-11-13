import { ForgotForm } from "@/app/auth/forgot/forgot-form";
import { AuthFrame } from "@/components/auth-frame";

export const metadata = { title: "Відновлення пароля" };

export default function ForgotPasswordPage() {
  return (
    <AuthFrame>
      <ForgotForm />
    </AuthFrame>
  );
}
