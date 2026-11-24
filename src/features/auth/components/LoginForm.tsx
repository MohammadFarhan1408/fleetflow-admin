"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/shared/FormField";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { LOGIN_NOTICES, ROUTES, safeNextPath } from "@/lib/routes";
import { login } from "../api";
import { authErrorAlert, type FormAlert } from "../messages";
import { loginSchema, type LoginValues } from "../schemas";
import { AuthAlert } from "./AuthAlert";

const NOTICES = {
  [LOGIN_NOTICES.sessionExpired]: { tone: "info", title: "Your session ended. Sign in again to continue." },
  [LOGIN_NOTICES.passwordReset]: { tone: "success", title: "Password saved. Sign in with your new password." },
} as const;

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formAlert, setFormAlert] = useState<FormAlert | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const notice = NOTICES[searchParams.get("notice") as keyof typeof NOTICES];

  const onSubmit = async (values: LoginValues) => {
    setFormAlert(null);
    try {
      await login(values);
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (error) {
      if (error instanceof ApiError && error.code === API_ERROR_CODES.validationInvalid) {
        const { email, password } = error.fieldErrors;
        if (email?.[0]) setError("email", { message: email[0] }, { shouldFocus: true });
        if (password?.[0]) setError("password", { message: password[0] });
        if (email || password) return;
      }
      setFormAlert(authErrorAlert(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {notice && !formAlert && <Alert tone={notice.tone} title={notice.title} />}
      {formAlert && <AuthAlert alert={formAlert} />}
      <FormField id="email" label="Email" error={errors.email?.message}>
        {(control) => <Input {...control} type="email" autoComplete="username" {...register("email")} />}
      </FormField>
      <FormField id="password" label="Password" error={errors.password?.message}>
        {(control) => <Input {...control} type="password" autoComplete="current-password" {...register("password")} />}
      </FormField>
      <Button type="submit" size="lg" loading={isSubmitting}>
        Sign in
      </Button>
      <Button variant="link" asChild className="self-start">
        <Link href={ROUTES.forgotPassword}>Forgot your password?</Link>
      </Button>
    </form>
  );
};
