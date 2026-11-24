import { Badge } from "@/components/ui/Badge";
import type { Customer } from "../api";

const KIND_LABELS: Record<Customer["kind"], string> = { individual: "Individual", business: "Business" };

export const CustomerKind = ({ kind }: { kind: Customer["kind"] }) => (
  <Badge tone={kind === "business" ? "info" : "neutral"}>{KIND_LABELS[kind]}</Badge>
);
