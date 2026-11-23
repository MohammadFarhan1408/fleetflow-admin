"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/shared/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { requestPasswordReset } from "../api";
import { authErrorAlert, type FormAlert } from "../messages";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import { AuthAlert } from "./auth-alert";

export const ForgotPasswordForm = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formAlert, setFormAlert] = useState<FormAlert | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), mode: "onTouched" });

  const onSubmit = async ({ email }: ForgotPasswordValues) => {
    setFormAlert(null);
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (error) {
      setFormAlert(authErrorAlert(error));
    }
  };

  const backToSignIn = (
    <Button variant="link" asChild className="self-start">
      <Link href={ROUTES.login}>Back to sign in</Link>
    </Button>
  );

  // The API answers 202 whether or not the account exists, so the message must not say which.
  if (sentTo) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success" title="Check your email">
          If an account exists for {sentTo}, we sent it a link to set a new password.
        </Alert>
        {backToSignIn}
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {formAlert && <AuthAlert alert={formAlert} />}
      <FormField id="email" label="Email" error={errors.email?.message}>
        {(control) => <Input {...control} type="email" autoComplete="username" {...register("email")} />}
      </FormField>
      <Button type="submit" size="lg" loading={isSubmitting}>
        Send reset link
      </Button>
      {backToSignIn}
    </form>
  );
};
