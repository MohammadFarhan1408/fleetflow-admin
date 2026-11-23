"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/shared/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { LOGIN_NOTICES, loginPath, ROUTES } from "@/lib/routes";
import { confirmPasswordReset } from "../api";
import { authErrorAlert, type FormAlert } from "../messages";
import { resetPasswordSchema, type ResetPasswordValues } from "../schemas";
import { AuthAlert } from "./auth-alert";

const requestNewLink = (
  <Button variant="link" asChild className="self-start">
    <Link href={ROUTES.forgotPassword}>Request a new link</Link>
  </Button>
);

/** Sets a password from an emailed reset or invitation link (`?uid=…&token=…`). */
export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [formAlert, setFormAlert] = useState<FormAlert | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), mode: "onTouched" });

  if (!uid || !token) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error" title="This link is incomplete">
          Open the link from your email again, or request a new one.
        </Alert>
        {requestNewLink}
      </div>
    );
  }

  const onSubmit = async ({ password }: ResetPasswordValues) => {
    setFormAlert(null);
    try {
      await confirmPasswordReset({ uid, token, new_password: password });
      router.replace(loginPath({ notice: LOGIN_NOTICES.passwordReset }));
    } catch (error) {
      const passwordErrors = error instanceof ApiError ? error.fieldErrors.new_password : undefined;
      if (error instanceof ApiError && error.code === API_ERROR_CODES.validationInvalid && passwordErrors?.length) {
        setError("password", { message: passwordErrors.join(" ") }, { shouldFocus: true });
        return;
      }
      setFormAlert(authErrorAlert(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {formAlert && <AuthAlert alert={formAlert} />}
      <FormField id="password" label="New password" error={errors.password?.message}>
        {(control) => <Input {...control} type="password" autoComplete="new-password" {...register("password")} />}
      </FormField>
      <FormField id="confirm-password" label="Confirm new password" error={errors.confirmPassword?.message}>
        {(control) => (
          <Input {...control} type="password" autoComplete="new-password" {...register("confirmPassword")} />
        )}
      </FormField>
      <Button type="submit" size="lg" loading={isSubmitting}>
        Save password
      </Button>
      {requestNewLink}
    </form>
  );
};
