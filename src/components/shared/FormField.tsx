import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { Label } from "@/components/ui/Label";

type ControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

type FormFieldProps = {
  id: string;
  label: React.ReactNode;
  /** Helper text under the control. Hidden while an error is shown. */
  description?: React.ReactNode;
  error?: string;
  /** Renders the control with the id and ARIA attributes that tie it to the label and messages. */
  children: (control: ControlProps) => React.ReactNode;
};

// design.md §6 Input: label above, helper or error text below; error = border + icon + message.
const FormField = ({ id, label, description, error, children }: FormFieldProps) => {
  const messageId = error || description ? `${id}-message` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": messageId })}
      {error ? (
        <p id={messageId} className="flex items-center gap-1 text-caption text-error">
          <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        description && (
          <p id={messageId} className="text-caption text-text-secondary">
            {description}
          </p>
        )
      )}
    </div>
  );
};

export { FormField };
