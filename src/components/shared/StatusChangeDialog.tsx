"use client";

import { useId, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChoiceCardGroup, type Choice } from "@/components/shared/ChoiceCardGroup";
import { FormField } from "@/components/shared/FormField";
import { REASON_MAX_LENGTH, statusChangeSchema, type StatusChangeValues } from "@/components/shared/status-change";
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

const FIELDS = ["status", "reason"] as const;

export type StatusChangeDialogProps<Saved extends { status: string }> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** What the record has now; the form starts from it each time the dialog opens. */
  current: { status: string; reason: string };
  choices: Choice<string>[];
  /** The status that needs no reason; the API clears a reason when it is chosen ("active"). */
  reasonFreeStatus: string;
  /** The error under an empty reason, e.g. "Say why the vehicle is in maintenance". */
  reasonMessage: (status: string) => string;
  reasonPlaceholder: string;
  /** Sends the change. Never optimistic: the caller refetches afterwards, also after a failure. */
  change: (request: { values: StatusChangeValues; idempotencyKey: string }) => Promise<Saved>;
  /** 403, 404 and "archived meanwhile" end the dialog with a toast; returns whether the error was one of them. */
  onFatalError: (error: unknown) => boolean;
  successTitle: (saved: Saved, previousStatus: string) => string;
};

/** The form. It lives inside the dialog content, so it starts from the record's current status each time it opens. */
const StatusForm = <Saved extends { status: string }>({
  props,
  onClose,
}: {
  props: StatusChangeDialogProps<Saved>;
  onClose: () => void;
}) => {
  const { current, choices, reasonFreeStatus, reasonMessage, reasonPlaceholder, change, onFatalError, successTitle } =
    props;
  const toast = useToast();
  const reasonId = useId();
  const idempotency = useIdempotencyKey();
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const schema = useMemo(
    () =>
      statusChangeSchema(
        choices.map((choice) => choice.value) as [string, ...string[]],
        reasonFreeStatus,
        reasonMessage,
      ),
    [choices, reasonFreeStatus, reasonMessage],
  );
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StatusChangeValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { status: current.status, reason: current.reason },
  });
  const { status, reason } = useWatch({ control });
  const needsReason = status !== reasonFreeStatus;

  const submit = async (entered: StatusChangeValues) => {
    setFormAlert(null);
    // The API keeps a reason only for a status that needs one, so the free status's is cleared.
    const values = { ...entered, reason: entered.status === reasonFreeStatus ? "" : entered.reason };
    try {
      const saved = await change({ values, idempotencyKey: idempotency.keyFor(values) });
      idempotency.reset();
      toast({ tone: "success", title: successTitle(saved, current.status) });
      onClose();
    } catch (error) {
      const { mapped, unmapped } = applyFieldErrors(error, setError, FIELDS);
      if (mapped) return;
      if (unmapped.length > 0) return setFormAlert({ title: "Check the details", detail: unmapped.join(" ") });
      if (onFatalError(error)) return;
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
            choices={choices}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {needsReason && (
        <FormField
          id={reasonId}
          label="Reason"
          required
          description={`${(reason ?? "").length}/${REASON_MAX_LENGTH}`}
          error={errors.reason?.message}
        >
          {(control) => <Textarea {...control} placeholder={reasonPlaceholder} {...register("reason")} />}
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

/** Change a record's status, with the reason the API requires for every status but the free one. */
export const StatusChangeDialog = <Saved extends { status: string }>(props: StatusChangeDialogProps<Saved>) => (
  <Dialog open={props.open} onOpenChange={props.onOpenChange}>
    <DialogContent size="form">
      <DialogHeader>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogDescription>{props.description}</DialogDescription>
      </DialogHeader>
      <StatusForm props={props} onClose={() => props.onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
