import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Reset password · FleetFlow Admin" };

const ForgotPasswordPage = () => (
  <AuthCard title="Reset your password">
    <ForgotPasswordForm />
  </AuthCard>
);

export default ForgotPasswordPage;
