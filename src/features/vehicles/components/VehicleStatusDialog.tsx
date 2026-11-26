"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChoiceCardGroup } from "@/components/shared/ChoiceCardGroup";
import { FormField } from "@/components/shared/FormField";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import type { Vehicle } from "../api";
import { VEHICLE_STATUS_LABELS } from "../labels";
import { useChangeVehicleStatus } from "../mutations";
import { REASON_MAX_LENGTH, statusChangeSchema, type StatusChangeValues } from "../schemas";
import { VEHICLE_STATUS_CHOICES } from "../status-choices";
import { useVehicleWriteError } from "../use-vehicle-write-error";

const FIELDS = ["status", "reason"] as const;

/** The form. It lives inside the dialog content, so it starts from the vehicle's current status each time it opens. */
const StatusForm = ({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) => {
  const toast = useToast();
  const change = useChangeVehicleStatus(vehicle.public_id);
  const idempotency = useIdempotencyKey();
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const handleFatalError = useVehicleWriteError(onClose);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StatusChangeValues>({
    resolver: zodResolver(statusChangeSchema),
    mode: "onTouched",
    defaultValues: { status: vehicle.status, reason: vehicle.status_reason },
  });
  const { status, reason } = useWatch({ control });
  const needsReason = status !== "active";

  const submit = async (entered: StatusChangeValues) => {
    setFormAlert(null);
    // The API keeps a reason only for a status other than active, so an active vehicle's is cleared.
    const values = { ...entered, reason: entered.status === "active" ? "" : entered.reason };
    try {
      const saved = await change.mutateAsync({ values, idempotencyKey: idempotency.keyFor(values) });
      idempotency.reset();
      toast({
        tone: "success",
        title:
          saved.status === vehicle.status
            ? `Reason for ${saved.registration_number} updated`
            : `${saved.registration_number} is now ${VEHICLE_STATUS_LABELS[saved.status].toLowerCase()}`,
      });
      onClose();
    } catch (error) {
      const { mapped, unmapped } = applyFieldErrors(error, setError, FIELDS);
      if (mapped) return;
      if (unmapped.length > 0) return setFormAlert({ title: "Check the details", detail: unmapped.join(" ") });
      if (handleFatalError(error)) return;
      setFormAlert(describeMutationError(error));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      {formAlert && (
        <Alert tone="error" title={formAlert.title}>
          {formAlert.detail}
        </Alert>
      )}
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <ChoiceCardGroup
            label="Status"
            required
            columns={1}
            choices={VEHICLE_STATUS_CHOICES}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {needsReason && (
        <FormField
          id={`${vehicle.public_id}-status-reason`}
          label="Reason"
          required
          description={`${(reason ?? "").length}/${REASON_MAX_LENGTH}`}
          error={errors.reason?.message}
        >
          {(control) => (
            <Textarea {...control} placeholder="What happened, and when it should be back" {...register("reason")} />
          )}
        </FormField>
      )}
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save status
        </Button>
      </DialogFooter>
    </form>
  );
};

/** Change a vehicle's status, with the reason the API requires for maintenance and out of service. */
export const VehicleStatusDialog = ({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent size="form">
      <DialogHeader>
        <DialogTitle>Change status of {vehicle.registration_number}</DialogTitle>
        <DialogDescription>
          {"A vehicle in maintenance or out of service can't be assigned to routes."}
        </DialogDescription>
      </DialogHeader>
      <StatusForm vehicle={vehicle} onClose={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
