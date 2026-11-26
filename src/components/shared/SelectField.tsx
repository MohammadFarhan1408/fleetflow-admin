"use client";

import type { Ref } from "react";

import { FormField } from "@/components/shared/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

type SelectFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  disabled?: boolean;
  /** From the form library's field: the chosen value ("" for none) and its handlers. */
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  ref?: Ref<HTMLButtonElement>;
};

/** A labelled single-choice field for forms (design.md §6 Select), with the same error and required marks as inputs. */
export const SelectField = ({
  id,
  label,
  required,
  error,
  placeholder,
  options,
  disabled,
  value,
  onValueChange,
  onBlur,
  name,
  ref,
}: SelectFieldProps) => (
  <FormField id={id} label={label} required={required} error={error}>
    {(control) => (
      <Select value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
        <SelectTrigger {...control} ref={ref} onBlur={onBlur}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  </FormField>
);
