import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard, AuthFormSkeleton } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in · FleetFlow Admin" };

const LoginPage = () => (
  <AuthCard title="Sign in">
    <Suspense fallback={<AuthFormSkeleton fields={2} />}>
      <LoginForm />
    </Suspense>
  </AuthCard>
);

export default LoginPage;
