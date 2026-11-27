"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChoiceCardGroup } from "@/components/shared/ChoiceCardGroup";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { useToast } from "@/components/shared/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { applyFieldErrors } from "@/lib/api/form-errors";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";
import { ROUTES, customerPath } from "@/lib/routes";
import type { Customer } from "../api";
import { CUSTOMER_KIND_CHOICES, CUSTOMER_NAME_FIELD } from "../kinds";
import { useSaveCustomer } from "../mutations";
import { normalizePhone } from "@/lib/phone";
import { customerSchema, type CustomerValues } from "../schemas";
import { useCustomerWriteError } from "../use-customer-write-error";
import { CustomerPreview } from "./CustomerPreview";

const FIELDS = ["kind", "name", "email", "phone"] as const;

// New customers default to a business: the API requires a type and most customers are companies.
const toFormValues = (customer?: Customer): CustomerValues => ({
  kind: customer?.kind ?? "business",
  name: customer?.name ?? "",
  email: customer?.email ?? "",
  phone: customer?.phone ?? "",
});

/** Add a customer, or edit `customer`. The same fields, rules and error handling serve both pages. */
export const CustomerForm = ({ customer }: { customer?: Customer }) => {
  const router = useRouter();
  const toast = useToast();
  const save = useSaveCustomer(customer);
  const [formAlert, setFormAlert] = useState<{ title: string; detail: string } | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  // Per-instance ids: Next keeps the previous page mounted but hidden, so two forms can exist at once.
  const formId = useId();
  const idempotency = useIdempotencyKey();
  const backHref = customer ? customerPath(customer.public_id) : ROUTES.customers;
  const handleFatalError = useCustomerWriteError(() => router.push(backHref));
  const {
    register,
    control,
    reset,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    mode: "onTouched",
    defaultValues: toFormValues(customer),
  });
  const values = useWatch({ control });
  const preview: CustomerValues = {
    kind: values.kind ?? "business",
    name: values.name ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
  };
  const nameField = CUSTOMER_NAME_FIELD[preview.kind];

  useUnsavedChangesWarning(isDirty);

  const submit = async (entered: CustomerValues) => {
    setFormAlert(null);
    const body = { ...entered, phone: normalizePhone(entered.phone) };
    try {
      const saved = await save.mutateAsync({ values: body, idempotencyKey: idempotency.keyFor(body) });
      idempotency.reset();
      // Next keeps this page mounted (hidden) after navigating away. Without this, opening the form again
      // would show what was just saved as unsaved changes, or the last customer's data on the add page.
      reset(toFormValues(customer && saved));
      toast({ tone: "success", title: `Customer ${saved.name} ${customer ? "updated" : "added"}` });
      router.push(customerPath(saved.public_id));
    } catch (error) {
      const { mapped, unmapped } = applyFieldErrors(error, setError, FIELDS);
      if (mapped) return;
      if (unmapped.length > 0) return setFormAlert({ title: "Check the details", detail: unmapped.join(" ") });
      if (handleFatalError(error)) return;
      setFormAlert(describeMutationError(error));
    }
  };

  return (
    <div className="grid max-w-5xl items-start gap-4 xl:grid-cols-12">
      <Card className="gap-0 overflow-hidden p-0 xl:col-span-8">
        <form noValidate onSubmit={handleSubmit(submit)}>
          <div className="flex flex-col gap-6 p-5">
            {formAlert && (
              <Alert tone="error" title={formAlert.title}>
                {formAlert.detail}
              </Alert>
            )}
            <Controller
              control={control}
              name="kind"
              render={({ field }) => (
                <ChoiceCardGroup
                  label="Customer type"
                  required
                  choices={CUSTOMER_KIND_CHOICES}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FormField id={`${formId}-name`} label={nameField.label} required error={errors.name?.message}>
              {(field) => (
                <Input
                  {...field}
                  autoComplete="off"
                  // The add page exists to enter a name, so the cursor starts there.
                  autoFocus={!customer}
                  placeholder={nameField.placeholder}
                  {...register("name")}
                />
              )}
            </FormField>
            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-h3 text-text">Contact details</h2>
                <p className="text-caption text-text-secondary">How to reach this customer.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField id={`${formId}-email`} label="Email" error={errors.email?.message}>
                  {(field) => (
                    <Input
                      {...field}
                      type="email"
                      autoComplete="off"
                      placeholder="name@company.com"
                      {...register("email")}
                    />
                  )}
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
            </div>
          </div>
          <FormFooter
            dirty={isDirty}
            submitting={isSubmitting}
            submitLabel={customer ? "Save changes" : "Add customer"}
            onCancel={() => (isDirty ? setConfirmingDiscard(true) : router.push(backHref))}
          />
        </form>
      </Card>
      <CustomerPreview values={preview} />
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
    </div>
  );
};
