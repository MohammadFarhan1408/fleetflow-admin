import { Building2Icon, UserRoundIcon } from "lucide-react";

import type { Choice } from "@/components/shared/ChoiceCardGroup";
import type { Customer } from "./api";
import { CUSTOMER_KIND_LABELS } from "./schemas";

type Kind = Customer["kind"];

/** The type cards on the form, and how the name field is worded for each type. */
export const CUSTOMER_KIND_CHOICES: Choice<Kind>[] = [
  {
    value: "business",
    label: CUSTOMER_KIND_LABELS.business,
    description: "A company that ships with you.",
    icon: Building2Icon,
  },
  {
    value: "individual",
    label: CUSTOMER_KIND_LABELS.individual,
    description: "A person who ships on their own.",
    icon: UserRoundIcon,
  },
];

export const CUSTOMER_NAME_FIELD: Record<Kind, { label: string; placeholder: string }> = {
  business: { label: "Company name", placeholder: "Northwind Traders" },
  individual: { label: "Full name", placeholder: "Ada Lovelace" },
};
