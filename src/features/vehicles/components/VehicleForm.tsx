"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/SelectField";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSession } from "@/features/session/SessionContext";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { ROUTES, vehiclePath } from "@/lib/routes";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";
import type { Vehicle } from "../api";
import { branchOptions } from "../branch-options";
import { LICENSE_CATEGORIES } from "../labels";
import { useSaveVehicle } from "../mutations";
import { vehicleSchema, type VehicleValues } from "../schemas";
import { useVehicleWriteError } from "../use-vehicle-write-error";

const FIELDS = [
  "registration_number",
  "branch_id",
  "required_license_category",
  "capacity_weight_kg",
  "capacity_volume_m3",
  "make",
  "model",
] as const;

const LICENSE_CHOICES = LICENSE_CATEGORIES.map((category) => ({ value: category, label: category }));

const toFormValues = (vehicle?: Vehicle): VehicleValues => ({
  registration_number: vehicle?.registration_number ?? "",
  branch_id: vehicle?.branch.public_id ?? "",
  required_license_category: vehicle?.required_license_category ?? "",
  capacity_weight_kg: vehicle?.capacity_weight_kg ?? "",
  capacity_volume_m3: vehicle?.capacity_volume_m3 ?? "",
  make: vehicle?.make ?? "",
  model: vehicle?.model ?? "",
});

/** Add a vehicle, or edit `vehicle`. The same fields, rules and error handling serve both pages. */
export const VehicleForm = ({ vehicle }: { vehicle?: Vehicle }) => {
  const router = useRouter();
  const toast = useToast();
  const { branches } = useSession();
  const save = useSaveVehicle(vehicle);
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  // Per-instance ids: Next keeps the previous page mounted but hidden, so two forms can exist at once.
  const formId = useId();
  const idempotency = useIdempotencyKey();
  const backHref = vehicle ? vehiclePath(vehicle.public_id) : ROUTES.vehicles;
  const handleFatalError = useVehicleWriteError(() => router.push(backHref));
  const branchChoices = branchOptions(branches, vehicle?.branch);
  const {
    register,
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    mode: "onTouched",
    defaultValues: toFormValues(vehicle),
  });

  useUnsavedChangesWarning(isDirty);

  const submit = async (entered: VehicleValues) => {
    setFormAlert(null);
    try {
      const saved = await save.mutateAsync({ values: entered, idempotencyKey: idempotency.keyFor(entered) });
      idempotency.reset();
      // Next keeps this page mounted (hidden) after navigating away; see CustomerForm.
      reset(toFormValues(vehicle && saved));
      toast({
        tone: "success",
        title: `Vehicle ${saved.registration_number} ${vehicle ? "updated" : "added"}`,
      });
      router.push(vehiclePath(saved.public_id));
    } catch (error) {
      if (error instanceof ApiError && error.code === API_ERROR_CODES.vehicleDuplicateRegistration) {
        return setError(
          "registration_number",
          { message: "A vehicle with this registration number already exists" },
          { shouldFocus: true },
        );
      }
      const { mapped, unmapped } = applyFieldErrors(error, setError, FIELDS);
      if (mapped) return;
      if (unmapped.length > 0) return setFormAlert({ title: "Check the details", detail: unmapped.join(" ") });
      if (handleFatalError(error)) return;
      setFormAlert(describeMutationError(error));
    }
  };

  return (
    <Card className="max-w-180 gap-0 overflow-hidden p-0">
      <form noValidate onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col gap-6 p-5">
          {formAlert && (
            <Alert tone="error" title={formAlert.title}>
              {formAlert.detail}
            </Alert>
          )}
          {branchChoices.length === 0 && (
            <Alert tone="warning" title="You aren't assigned to a branch">
              A vehicle needs a branch, and there is none to choose. Ask an administrator to add you to one.
            </Alert>
          )}
          <FormSection title="Vehicle" description="How to recognise it.">
            <FormField
              id={`${formId}-registration`}
              label="Registration number"
              required
              description="Saved in capitals, with single spaces."
              error={errors.registration_number?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  autoComplete="off"
                  autoFocus={!vehicle}
                  placeholder="B AB 1234"
                  {...register("registration_number")}
                />
              )}
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id={`${formId}-make`} label="Make" error={errors.make?.message}>
                {(field) => <Input {...field} autoComplete="off" placeholder="Mercedes" {...register("make")} />}
              </FormField>
              <FormField id={`${formId}-model`} label="Model" error={errors.model?.message}>
                {(field) => <Input {...field} autoComplete="off" placeholder="Sprinter" {...register("model")} />}
              </FormField>
            </div>
          </FormSection>
          <FormSection title="Base and licence" description="Where it is based and who may drive it.">
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="branch_id"
                render={({ field }) => (
                  <SelectField
                    {...field}
                    id={`${formId}-branch`}
                    label="Branch"
                    required
                    error={errors.branch_id?.message}
                    placeholder={branchChoices.length === 0 ? "No branches available" : "Choose a branch"}
                    options={branchChoices}
                    disabled={branchChoices.length === 0}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="required_license_category"
                render={({ field }) => (
                  <SelectField
                    {...field}
                    id={`${formId}-license`}
                    label="Required licence category"
                    required
                    error={errors.required_license_category?.message}
                    placeholder="Choose a category"
                    options={LICENSE_CHOICES}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
          </FormSection>
          <FormSection title="Capacity" description="What it can carry. Dispatch checks loads against this.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                id={`${formId}-weight`}
                label="Weight capacity (kg)"
                required
                error={errors.capacity_weight_kg?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="1500"
                    {...register("capacity_weight_kg")}
                  />
                )}
              </FormField>
              <FormField
                id={`${formId}-volume`}
                label="Volume capacity (m³)"
                required
                error={errors.capacity_volume_m3?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="12.5"
                    {...register("capacity_volume_m3")}
                  />
                )}
              </FormField>
            </div>
          </FormSection>
        </div>
        <FormFooter
          dirty={isDirty}
          submitting={isSubmitting}
          submitLabel={vehicle ? "Save changes" : "Add vehicle"}
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
