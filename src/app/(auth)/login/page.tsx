import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard, AuthFormSkeleton } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in · FleetFlow Admin" };

const LoginPage = () => (
  <AuthCard title="Sign in" description="Use the email address your company invited.">
    <Suspense fallback={<AuthFormSkeleton fields={2} />}>
      <LoginForm />
    </Suspense>
    <p className="border-t border-border pt-4 text-caption text-muted">
      No account yet? Ask your company administrator to invite you.
    </p>
  </AuthCard>
);

export default LoginPage;
