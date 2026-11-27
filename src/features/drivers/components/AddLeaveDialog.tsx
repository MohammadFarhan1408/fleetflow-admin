"use client";

import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/shared/FormField";
import { REASON_MAX_LENGTH } from "@/components/shared/status-change";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { leaveDays } from "../leave";
import { useAddLeave } from "../mutations";
import { leaveSchema, type LeaveValues } from "../schemas";
import { useDriverWriteError } from "../use-driver-write-error";

const FIELDS = ["starts_on", "ends_on", "reason"] as const;

/** "5 days" for a valid period, otherwise nothing: the schema explains what is wrong. */
const periodLength = ({ starts_on, ends_on }: Partial<LeaveValues>) => {
  if (!starts_on || !ends_on || ends_on < starts_on) return null;
  const days = leaveDays(starts_on, ends_on);
  return `${days} ${days === 1 ? "day" : "days"}`;
};

/** The form. It lives inside the dialog content, so it starts empty each time it opens. */
const LeaveForm = ({ driverId, onClose }: { driverId: string; onClose: () => void }) => {
  const toast = useToast();
  const formId = useId();
  const add = useAddLeave(driverId);
  const idempotency = useIdempotencyKey();
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const handleFatalError = useDriverWriteError(onClose);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeaveValues>({
    resolver: zodResolver(leaveSchema),
    mode: "onTouched",
    defaultValues: { starts_on: "", ends_on: "", reason: "" },
  });
  const period = useWatch({ control });

  const submit = async (values: LeaveValues) => {
    setFormAlert(null);
    try {
      await add.mutateAsync({ values, idempotencyKey: idempotency.keyFor(values) });
      idempotency.reset();
      toast({ tone: "success", title: "Leave added" });
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === API_ERROR_CODES.driverLeaveOverlap) {
        return setError("starts_on", { message: "This overlaps leave already recorded" }, { shouldFocus: true });
      }
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="starts_on"
          render={({ field }) => (
            <FormField id={`${formId}-from`} label="First day" required error={errors.starts_on?.message}>
              {(control) => (
                <DatePicker
                  {...control}
                  label="First day"
                  placeholder="Choose a day"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="ends_on"
          render={({ field }) => (
            <FormField
              id={`${formId}-to`}
              label="Last day"
              required
              description={periodLength(period) ?? "Included in the leave."}
              error={errors.ends_on?.message}
            >
              {(control) => (
                <DatePicker
                  {...control}
                  label="Last day"
                  placeholder="Choose a day"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            </FormField>
          )}
        />
      </div>
      <FormField
        id={`${formId}-reason`}
        label="Reason"
        required
        description={`${(period.reason ?? "").length}/${REASON_MAX_LENGTH}`}
        error={errors.reason?.message}
      >
        {(control) => (
          <Textarea {...control} placeholder="Annual leave, sick leave, training…" {...register("reason")} />
        )}
      </FormField>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Add leave
        </Button>
      </DialogFooter>
    </form>
  );
};

/** Record a period the driver is away. Both days count, up to 366 days; the API refuses overlapping periods. */
export const AddLeaveDialog = ({
  driverId,
  driverName,
  open,
  onOpenChange,
}: {
  driverId: string;
  driverName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent size="form">
      <DialogHeader>
        <DialogTitle>Add leave for {driverName}</DialogTitle>
        <DialogDescription>{"They can't be assigned to routes on these days."}</DialogDescription>
      </DialogHeader>
      <LeaveForm driverId={driverId} onClose={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
