import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password · FleetFlow Admin" };

const ForgotPasswordPage = () => (
  <AuthCard title="Reset your password" description="We'll email you a link to choose a new one.">
    <ForgotPasswordForm />
  </AuthCard>
);

export default ForgotPasswordPage;
