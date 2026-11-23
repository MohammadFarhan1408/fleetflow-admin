import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard, AuthFormSkeleton } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

// Reached from password reset and invitation emails (fleetflow-api PASSWORD_RESET_URL).
export const metadata: Metadata = { title: "Set password · FleetFlow Admin", referrer: "no-referrer" };

const ResetPasswordPage = () => (
  <AuthCard title="Set your password" description="Choose a password for your FleetFlow account.">
    <Suspense fallback={<AuthFormSkeleton fields={2} />}>
      <ResetPasswordForm />
    </Suspense>
  </AuthCard>
);

export default ResetPasswordPage;
