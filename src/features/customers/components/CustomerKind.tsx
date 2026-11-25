import { Badge } from "@/components/ui/Badge";
import type { Customer } from "../api";
import { CUSTOMER_KIND_LABELS } from "../schemas";

export const CustomerKind = ({ kind }: { kind: Customer["kind"] }) => (
  <Badge tone={kind === "business" ? "info" : "neutral"}>{CUSTOMER_KIND_LABELS[kind]}</Badge>
);
