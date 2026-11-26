"use client";

import { useId } from "react";
import { CircleCheckIcon, type LucideIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

import { RequiredMark } from "./FormField";

export type Choice<Value extends string> = {
  value: Value;
  label: string;
  description: string;
  icon: LucideIcon;
};

const ChoiceCard = <Value extends string>({ value, label, description, icon: Icon }: Choice<Value>) => {
  const labelId = useId();
  const descriptionId = useId();
  return (
    <RadioGroupPrimitive.Item
      value={value}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      className="group relative flex items-start gap-3 rounded-lg border border-border-input bg-surface p-3 pr-8 text-left transition-colors hover:bg-hover data-[state=checked]:border-primary data-[state=checked]:bg-primary-subtle"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-sunken text-muted transition-colors group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-fg">
        <Icon aria-hidden className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span id={labelId} className="text-body-strong text-text">
          {label}
        </span>
        <span id={descriptionId} className="text-caption text-text-secondary">
          {description}
        </span>
      </span>
      {/* The check mark, not only the colour, shows which card is chosen (design.md §10). */}
      <RadioGroupPrimitive.Indicator className="absolute top-3 right-3 text-primary">
        <CircleCheckIcon aria-hidden className="size-4" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
};

type ChoiceCardGroupProps<Value extends string> = {
  label: string;
  choices: Choice<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  onBlur?: () => void;
  required?: boolean;
  /** Cards per row from `sm` up. Two suits short descriptions; one suits three or more. */
  columns?: 1 | 2;
};

/**
 * design.md §6 Choice cards: a few mutually exclusive options that each need a sentence of explanation,
 * as cards instead of a select. A radio group underneath: one tab stop, arrow keys move the choice.
 */
export const ChoiceCardGroup = <Value extends string>({
  label,
  choices,
  value,
  onValueChange,
  onBlur,
  required,
  columns = 2,
}: ChoiceCardGroupProps<Value>) => {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-label text-text">
        {label}
        {required && <RequiredMark />}
      </span>
      <RadioGroupPrimitive.Root
        aria-labelledby={labelId}
        required={required}
        value={value}
        onValueChange={(next) => onValueChange(next as Value)}
        onBlur={onBlur}
        className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")}
      >
        {choices.map((choice) => (
          <ChoiceCard key={choice.value} {...choice} />
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
};
