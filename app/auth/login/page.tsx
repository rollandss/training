import { LoginForm } from "@/app/auth/login/login-form";
import { AuthFrame } from "@/components/auth-frame";

export default function LoginPage() {
  return (
    <AuthFrame>
      <LoginForm />
    </AuthFrame>
  );
}
