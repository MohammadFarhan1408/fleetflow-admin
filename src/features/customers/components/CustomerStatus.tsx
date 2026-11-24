import { Badge } from "@/components/ui/Badge";

/** Archived customers are kept for history and hidden from lists by default. Addresses archive the same way. */
export const ArchiveStatus = ({ archivedAt }: { archivedAt: string | null }) =>
  archivedAt ? <Badge tone="neutral">Archived</Badge> : <Badge tone="success">Active</Badge>;
