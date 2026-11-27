"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { FileDropzone } from "@/components/shared/FileDropzone";
import { FormField } from "@/components/shared/FormField";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { LICENSE_CATEGORIES } from "@/features/vehicles/labels";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { browserToday } from "@/lib/calendar";
import type { DocumentOwner } from "../api";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES, NUMBER_MAX_LENGTH, TYPES_WITH_EXPIRY } from "../labels";
import { useAddDocument } from "../mutations";
import { documentSchema, type DocumentValues } from "../schemas";
import { useDocumentWriteError } from "../use-document-write-error";

const FIELDS = ["type", "upload_id", "number", "issued_on", "expires_on", "categories"] as const;

// The attached upload is gone, used or not confirmed: the file has to be sent again.
const UPLOAD_LOST_CODES: readonly (string | null)[] = [
  API_ERROR_CODES.uploadInUse,
  API_ERROR_CODES.uploadNotConfirmed,
  API_ERROR_CODES.invalidReference,
];

/** The form. It lives inside the dialog content, so it starts empty each time it opens. */
const DocumentForm = ({ owner, ownerId, onClose }: { owner: DocumentOwner; ownerId: string; onClose: () => void }) => {
  const toast = useToast();
  const formId = useId();
  const add = useAddDocument(owner, ownerId);
  const idempotency = useIdempotencyKey();
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const handleFatalError = useDocumentWriteError(owner, onClose);
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DocumentValues>({
    resolver: zodResolver(documentSchema),
    mode: "onTouched",
    defaultValues: {
      type: DOCUMENT_TYPES[owner][0],
      upload_id: "",
      number: "",
      issued_on: "",
      expires_on: "",
      categories: [],
    },
  });
  const { type, expires_on: expiresOn } = useWatch({ control });
  const needsExpiry = TYPES_WITH_EXPIRY.some((required) => required === type);
  const isLicence = type === "license";

  const submit = async (values: DocumentValues) => {
    setFormAlert(null);
    try {
      await add.mutateAsync({ values, idempotencyKey: idempotency.keyFor(values) });
      idempotency.reset();
      toast({
        tone: "success",
        title: `${DOCUMENT_TYPE_LABELS[values.type as keyof typeof DOCUMENT_TYPE_LABELS]} added`,
      });
      onClose();
    } catch (error) {
      if (error instanceof ApiError && UPLOAD_LOST_CODES.includes(error.code)) {
        setValue("upload_id", "");
        setDropzoneKey((key) => key + 1); // a new dropzone: the old file is no longer attachable
        return setError(
          "upload_id",
          { message: "That file can't be used any more. Add it again." },
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
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      {formAlert && (
        <Alert tone="error" title={formAlert.title}>
          {formAlert.detail}
        </Alert>
      )}
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <FormField id={`${formId}-type`} label="Document type" required error={errors.type?.message}>
            {(controlProps) => (
              <SegmentedControl
                id={controlProps.id}
                label="Document type"
                required
                invalid={Boolean(errors.type)}
                describedBy={controlProps["aria-describedby"]}
                options={DOCUMENT_TYPES[owner].map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }))}
                value={field.value}
                onValueChange={(next) => {
                  field.onChange(next);
                  if (next !== "license") setValue("categories", []);
                }}
                onBlur={field.onBlur}
              />
            )}
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="upload_id"
        render={({ field }) => (
          <FormField id={`${formId}-file`} label="File" required error={errors.upload_id?.message}>
            {(controlProps) => (
              <FileDropzone
                key={dropzoneKey}
                aria-invalid={controlProps["aria-invalid"]}
                aria-describedby={controlProps["aria-describedby"]}
                onChange={field.onChange}
                onBusyChange={setUploading}
              />
            )}
          </FormField>
        )}
      />
      {isLicence && (
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <FormField
              id={`${formId}-categories`}
              label="Licence categories"
              required
              error={errors.categories?.message}
            >
              {(controlProps) => (
                <div
                  role="group"
                  aria-label="Licence categories"
                  aria-describedby={controlProps["aria-describedby"]}
                  className="grid grid-cols-4 gap-x-4 gap-y-2 sm:grid-cols-6"
                >
                  {LICENSE_CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-body text-text">
                      <Checkbox
                        checked={field.value.includes(category)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked ? [...field.value, category] : field.value.filter((chosen) => chosen !== category),
                          )
                        }
                      />
                      {category}
                    </label>
                  ))}
                </div>
              )}
            </FormField>
          )}
        />
      )}
      <FormField
        id={`${formId}-number`}
        label={isLicence ? "Licence number" : "Document number"}
        error={errors.number?.message}
        description={`Up to ${NUMBER_MAX_LENGTH} characters. Only people who manage the fleet can see it.`}
      >
        {(controlProps) => <Input {...controlProps} autoComplete="off" {...register("number")} />}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="issued_on"
          render={({ field }) => (
            <FormField id={`${formId}-issued`} label="Issued on" error={errors.issued_on?.message}>
              {(controlProps) => (
                <DatePicker
                  {...controlProps}
                  label="Issued on"
                  placeholder="Choose a day"
                  resetLabel="Clear"
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
          name="expires_on"
          render={({ field }) => (
            <FormField
              id={`${formId}-expires`}
              label="Expires on"
              required={needsExpiry}
              description={
                expiresOn && expiresOn < browserToday()
                  ? "This day has passed, so the document counts as expired."
                  : "The last day it is valid."
              }
              error={errors.expires_on?.message}
            >
              {(controlProps) => (
                <DatePicker
                  {...controlProps}
                  label="Expires on"
                  placeholder="Choose a day"
                  resetLabel="Clear"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            </FormField>
          )}
        />
      </div>
      <DialogFooter className="items-center">
        {uploading && (
          <p role="status" className="text-caption text-text-secondary sm:mr-auto">
            Waiting for the upload to finish…
          </p>
        )}
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={uploading}>
          Add document
        </Button>
      </DialogFooter>
    </form>
  );
};

/** Add a document: choose the type and the file (it uploads at once), then the dates. Save attaches the uploaded file. */
export const AddDocumentDialog = ({
  owner,
  ownerId,
  ownerName,
  open,
  onOpenChange,
}: {
  owner: DocumentOwner;
  ownerId: string;
  ownerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent size="form">
      <DialogHeader>
        <DialogTitle>Add a document for {ownerName}</DialogTitle>
        <DialogDescription>The file is uploaded as soon as you choose it.</DialogDescription>
      </DialogHeader>
      <DocumentForm owner={owner} ownerId={ownerId} onClose={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
