import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { Label } from "@/components/ui/Label";

type ControlProps = {
  id: string;
  "aria-required": boolean | undefined;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

type FormFieldProps = {
  id: string;
  label: React.ReactNode;
  /** Helper text under the control. Hidden while an error is shown. */
  description?: React.ReactNode;
  error?: string;
  /** Marks the field with an asterisk. Optional fields carry no mark, so nothing says "optional". */
  required?: boolean;
  /** Renders the control with the id and ARIA attributes that tie it to the label and messages. */
  children: (control: ControlProps) => React.ReactNode;
};

/** The asterisk is for sighted users; the control itself says it is required. */
export const RequiredMark = () => (
  <span aria-hidden className="ml-1 text-error">
    *
  </span>
);

// design.md §6 Input: label above, helper or error text below; error = border + icon + message.
const FormField = ({ id, label, description, error, required, children }: FormFieldProps) => {
  const messageId = error || description ? `${id}-message` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>
        <span>
          {label}
          {required && <RequiredMark />}
        </span>
      </Label>
      {children({
        id,
        "aria-required": required || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": messageId,
      })}
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
