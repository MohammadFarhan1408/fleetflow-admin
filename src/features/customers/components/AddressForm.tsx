"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { customerPath } from "@/lib/routes";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";
import type { CustomerAddress } from "../api";
import { COUNTRY_OPTIONS } from "../countries";
import { useSaveAddress } from "../mutations";
import { addressSchema, toAddressBody, type AddressValues } from "../schemas";
import { useCustomerWriteError } from "../use-customer-write-error";
import { addressTitle } from "../format-address";

const FIELDS = [
  "label",
  "contact_name",
  "phone",
  "line1",
  "line2",
  "city",
  "region",
  "postal_code",
  "country",
  "latitude",
  "longitude",
] as const;

const toFormValues = (address?: CustomerAddress): AddressValues => ({
  label: address?.label ?? "",
  contact_name: address?.contact_name ?? "",
  phone: address?.phone ?? "",
  line1: address?.line1 ?? "",
  line2: address?.line2 ?? "",
  city: address?.city ?? "",
  region: address?.region ?? "",
  postal_code: address?.postal_code ?? "",
  country: address?.country ?? "",
  latitude: address?.latitude?.toString() ?? "",
  longitude: address?.longitude?.toString() ?? "",
});

const Group = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
    <div className="flex flex-col gap-1">
      <h2 className="text-h3 text-text">{title}</h2>
      <p className="text-caption text-text-secondary">{description}</p>
    </div>
    {children}
  </div>
);

/** Add an address to `customerId`, or edit `address`. The same fields, rules and error handling serve both pages. */
export const AddressForm = ({ customerId, address }: { customerId: string; address?: CustomerAddress }) => {
  const router = useRouter();
  const toast = useToast();
  const save = useSaveAddress(customerId, address);
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  // Per-instance ids: Next keeps the previous page mounted but hidden, so two forms can exist at once.
  const formId = useId();
  const idempotency = useIdempotencyKey();
  const backHref = customerPath(customerId);
  const handleFatalError = useCustomerWriteError(() => router.push(backHref), backHref);
  const {
    register,
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    mode: "onTouched",
    defaultValues: toFormValues(address),
  });

  useUnsavedChangesWarning(isDirty);

  const submit = async (entered: AddressValues) => {
    setFormAlert(null);
    try {
      const saved = await save.mutateAsync({
        values: entered,
        idempotencyKey: idempotency.keyFor(toAddressBody(entered)),
      });
      idempotency.reset();
      // Next keeps this page mounted (hidden) after navigating away; see CustomerForm.
      reset(toFormValues(address && saved));
      toast({ tone: "success", title: `Address ${addressTitle(saved)} ${address ? "updated" : "added"}` });
      router.push(backHref);
    } catch (error) {
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
          <Group title="Address" description="Where to pick up or deliver.">
            <FormField id={`${formId}-line1`} label="Address line 1" required error={errors.line1?.message}>
              {(field) => (
                <Input
                  {...field}
                  autoComplete="off"
                  autoFocus={!address}
                  placeholder="Hafenstrasse 4"
                  {...register("line1")}
                />
              )}
            </FormField>
            <FormField id={`${formId}-line2`} label="Address line 2" error={errors.line2?.message}>
              {(field) => <Input {...field} autoComplete="off" placeholder="Building, floor" {...register("line2")} />}
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id={`${formId}-city`} label="City" required error={errors.city?.message}>
                {(field) => <Input {...field} autoComplete="off" {...register("city")} />}
              </FormField>
              <FormField id={`${formId}-region`} label="State or region" error={errors.region?.message}>
                {(field) => <Input {...field} autoComplete="off" {...register("region")} />}
              </FormField>
              <FormField id={`${formId}-postal_code`} label="Postal code" error={errors.postal_code?.message}>
                {(field) => <Input {...field} autoComplete="off" {...register("postal_code")} />}
              </FormField>
              <FormField id={`${formId}-country`} label="Country" required error={errors.country?.message}>
                {(field) => (
                  <Controller
                    control={control}
                    name="country"
                    render={({ field: country }) => (
                      <Select value={country.value} onValueChange={country.onChange} name={country.name}>
                        <SelectTrigger {...field} ref={country.ref} onBlur={country.onBlur}>
                          <SelectValue placeholder="Choose a country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map(({ code, label }) => (
                            <SelectItem key={code} value={code}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
            </div>
          </Group>
          <Group title="Label and contact" description="Helps your team recognise this address and who to call there.">
            <FormField id={`${formId}-label`} label="Label" error={errors.label?.message}>
              {(field) => <Input {...field} autoComplete="off" placeholder="Main warehouse" {...register("label")} />}
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id={`${formId}-contact_name`} label="Contact name" error={errors.contact_name?.message}>
                {(field) => <Input {...field} autoComplete="off" {...register("contact_name")} />}
              </FormField>
              <FormField id={`${formId}-phone`} label="Phone" error={errors.phone?.message}>
                {(field) => (
                  <Input
                    {...field}
                    type="tel"
                    autoComplete="off"
                    placeholder="+1 415 555 0123"
                    {...register("phone")}
                  />
                )}
              </FormField>
            </div>
          </Group>
          <Group title="Location" description="Coordinates, if you know them. Enter both or leave both empty.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField id={`${formId}-latitude`} label="Latitude" error={errors.latitude?.message}>
                {(field) => (
                  <Input
                    {...field}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="52.5200"
                    {...register("latitude")}
                  />
                )}
              </FormField>
              <FormField id={`${formId}-longitude`} label="Longitude" error={errors.longitude?.message}>
                {(field) => (
                  <Input
                    {...field}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="13.4050"
                    {...register("longitude")}
                  />
                )}
              </FormField>
            </div>
          </Group>
        </div>
        <FormFooter
          dirty={isDirty}
          submitting={isSubmitting}
          submitLabel={address ? "Save changes" : "Add address"}
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
