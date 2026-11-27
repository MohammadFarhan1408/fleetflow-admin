"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BranchSelectField } from "@/features/branches/components/BranchSelectField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/SelectField";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { usePermissions } from "@/features/session/SessionContext";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { PERMISSIONS } from "@/lib/permissions";
import { driverPath, ROUTES } from "@/lib/routes";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";
import type { Driver } from "../api";
import { driverCandidatesQuery } from "../driver-candidates";
import { useSaveDriver } from "../mutations";
import { driverSchema, type DriverValues } from "../schemas";
import { useDriverWriteError } from "../use-driver-write-error";

const FIELDS = ["user_id", "branch_id", "phone"] as const;

const toFormValues = (driver?: Driver): DriverValues => ({
  user_id: driver?.user.public_id ?? "",
  branch_id: driver?.branch.public_id ?? "",
  phone: driver?.phone ?? "",
});

/** Who can be picked on create, and what to say when nobody can. Needs `users.view` (stopgap, see driver-candidates). */
const useCandidates = (enabled: boolean) => {
  const query = useQuery({ ...driverCandidatesQuery, enabled });
  return {
    query,
    options: (query.data?.candidates ?? []).map((user) => ({
      value: user.public_id,
      label: `${user.full_name} · ${user.email}`,
    })),
  };
};

/** Add a driver profile, or edit `driver`'s branch and phone. The same fields, rules and error handling serve both. */
export const DriverForm = ({ driver }: { driver?: Driver }) => {
  const router = useRouter();
  const toast = useToast();
  const { can } = usePermissions();
  const canListUsers = can(PERMISSIONS.usersView);
  const candidates = useCandidates(!driver && canListUsers);
  const save = useSaveDriver(driver);
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  // Per-instance ids: Next keeps the previous page mounted but hidden, so two forms can exist at once.
  const formId = useId();
  const idempotency = useIdempotencyKey();
  const backHref = driver ? driverPath(driver.public_id) : ROUTES.drivers;
  const handleFatalError = useDriverWriteError(() => router.push(backHref));
  const {
    register,
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DriverValues>({
    resolver: zodResolver(driverSchema(!driver)),
    mode: "onTouched",
    defaultValues: toFormValues(driver),
  });

  useUnsavedChangesWarning(isDirty);

  const submit = async (entered: DriverValues) => {
    setFormAlert(null);
    try {
      const saved = await save.mutateAsync({ values: entered, idempotencyKey: idempotency.keyFor(entered) });
      idempotency.reset();
      // Next keeps this page mounted (hidden) after navigating away; see CustomerForm.
      reset(toFormValues(driver && saved));
      toast({ tone: "success", title: `Driver ${saved.user.full_name} ${driver ? "updated" : "added"}` });
      router.push(driverPath(saved.public_id));
    } catch (error) {
      if (error instanceof ApiError && error.code === API_ERROR_CODES.driverAlreadyExists) {
        return setError("user_id", { message: "This user already has a driver profile" }, { shouldFocus: true });
      }
      const { mapped, unmapped } = applyFieldErrors(error, setError, FIELDS);
      if (mapped) return;
      if (unmapped.length > 0) return setFormAlert({ title: "Check the details", detail: unmapped.join(" ") });
      if (handleFatalError(error)) return;
      setFormAlert(describeMutationError(error));
    }
  };

  const noCandidates = candidates.query.isSuccess && candidates.options.length === 0;
  return (
    <Card className="max-w-180 gap-0 overflow-hidden p-0">
      <form noValidate onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col gap-6 p-5">
          {formAlert && (
            <Alert tone="error" title={formAlert.title}>
              {formAlert.detail}
            </Alert>
          )}
          {!driver && !canListUsers && (
            <Alert tone="warning" title="You can't choose a user">
              Only owners, administrators and operations managers can list users. Ask one of them to add the driver
              profile.
            </Alert>
          )}
          {noCandidates && (
            <Alert tone="info" title="No users are waiting for a driver profile">
              Invite the person in Settings → Users with the Driver role first, then come back.
            </Alert>
          )}
          {candidates.query.isError && (
            <Alert tone="error" title="Couldn't load the users">
              <Button type="button" variant="secondary" size="sm" onClick={() => void candidates.query.refetch()}>
                Try again
              </Button>
            </Alert>
          )}
          <FormSection title="Driver" description="Who they are. The user must have the Driver role.">
            {driver ? (
              <FormField id={`${formId}-user`} label="User">
                {(field) => <Input {...field} readOnly value={`${driver.user.full_name} · ${driver.user.email}`} />}
              </FormField>
            ) : (
              <>
                <Controller
                  control={control}
                  name="user_id"
                  render={({ field }) => (
                    <SelectField
                      {...field}
                      id={`${formId}-user`}
                      label="User"
                      required
                      error={errors.user_id?.message}
                      placeholder={candidates.query.isPending && canListUsers ? "Loading users…" : "Choose a user"}
                      options={candidates.options}
                      disabled={candidates.options.length === 0}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                {candidates.query.data?.truncated && (
                  <p className="text-caption text-text-secondary">
                    {"Showing the first users only. Someone missing from the list can't be chosen yet."}
                  </p>
                )}
              </>
            )}
          </FormSection>
          <FormSection title="Base and contact" description="Where they are based and how to reach them.">
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="branch_id"
                render={({ field }) => (
                  <BranchSelectField
                    {...field}
                    id={`${formId}-branch`}
                    error={errors.branch_id?.message}
                    current={driver?.branch}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <FormField
                id={`${formId}-phone`}
                label="Phone"
                required
                description="With the country code, like +49 151 1234 5678."
                error={errors.phone?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="tel"
                    autoComplete="off"
                    placeholder="+49 151 1234 5678"
                    {...register("phone")}
                  />
                )}
              </FormField>
            </div>
          </FormSection>
        </div>
        <FormFooter
          dirty={isDirty}
          submitting={isSubmitting}
          submitLabel={driver ? "Save changes" : "Add driver"}
          onCancel={() => (isDirty ? setConfirmingDiscard(true) : router.push(backHref))}
        />
      </form>
      <ConfirmDialog
        open={confirmingDiscard}
        onOpenChange={setConfirmingDiscard}
        title="Discard your changes?"
        description="What you entered won't be saved."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => router.push(backHref)}
      />
    </Card>
  );
};
