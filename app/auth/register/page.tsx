import { RegisterForm } from "@/app/auth/register/register-form";
import { AuthFrame } from "@/components/auth-frame";

export default function RegisterPage() {
  return (
    <AuthFrame>
      <RegisterForm />
    </AuthFrame>
  );
}
