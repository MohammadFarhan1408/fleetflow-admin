import { Badge } from "@/components/ui/Badge";

type RecordStatusBadgeProps = {
  archivedAt: string | null;
  label: string;
  tone: React.ComponentProps<typeof Badge>["tone"];
};

/** design.md §7. An archived record shows as archived: its status no longer applies. */
export const RecordStatusBadge = ({ archivedAt, label, tone }: RecordStatusBadgeProps) =>
  archivedAt ? <Badge tone="neutral">Archived</Badge> : <Badge tone={tone}>{label}</Badge>;
