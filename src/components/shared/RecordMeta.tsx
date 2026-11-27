import { formatDate } from "@/lib/format";

/** When a record was added, last changed and archived: a quiet line at the foot of a detail page. */
export const RecordMeta = ({
  createdAt,
  updatedAt,
  archivedAt,
}: {
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}) => (
  <p className="text-caption text-muted">
    Added {formatDate(createdAt)} · Last updated {formatDate(updatedAt)}
    {archivedAt && ` · Archived ${formatDate(archivedAt)}`}
  </p>
);
