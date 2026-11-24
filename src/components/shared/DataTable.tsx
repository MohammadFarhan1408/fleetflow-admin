import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";

export type Column<Row> = {
  id: string;
  header: string;
  cell: (row: Row) => React.ReactNode;
  /** Numeric columns align right (design.md §6 Table). */
  align?: "start" | "end";
  className?: string;
};

type DataTableProps<Row> = {
  /** Accessible name for the table (visually hidden). */
  caption: string;
  columns: Column<Row>[];
  rows: Row[] | undefined;
  getRowId: (row: Row) => string;
  loading?: boolean;
  /** Shown instead of rows when the request failed. */
  error?: React.ReactNode;
  /** Shown when the request succeeded with no rows. */
  empty: React.ReactNode;
  /** Pagination or other controls under the table. */
  footer?: React.ReactNode;
  /** Skeleton rows while loading. */
  skeletonRows?: number;
};

const headerCell = "sticky top-0 bg-surface-sunken px-4 py-3 text-left text-overline text-text-secondary";
const bodyCell = "px-4 py-2 align-middle text-table text-text";

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-1">{children}</div>
);

/**
 * design.md §6 Table: overline headers on a sunken band, 1 px row dividers, hover overlay, horizontal
 * scroll inside the panel on narrow screens. ponytail: rendering only; add TanStack Table (architecture §2)
 * when a list needs sorting, column visibility, selection or virtualization (D-ADM-20).
 */
export const DataTable = <Row,>({
  caption,
  columns,
  rows,
  getRowId,
  loading = false,
  error,
  empty,
  footer,
  skeletonRows = 8,
}: DataTableProps<Row>) => {
  const showRows = !loading && !error && rows && rows.length > 0;
  return (
    <Panel>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" aria-busy={loading || undefined}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(headerCell, column.align === "end" && "text-right", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: skeletonRows }, (_, index) => (
                <tr key={index} aria-hidden className="h-10">
                  {columns.map((column) => (
                    <td key={column.id} className={bodyCell}>
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            {showRows &&
              rows.map((row) => (
                <tr key={getRowId(row)} className="h-10 transition-colors hover:bg-hover">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(bodyCell, column.align === "end" && "text-right tabular-nums", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && (error ?? (rows?.length === 0 && empty))}
      {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
    </Panel>
  );
};

/** Server-safe placeholder in the table's panel, for `<Suspense>` fallbacks before the table mounts. */
export const DataTableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <Panel>
    <div role="status" aria-busy="true" aria-label="Loading table" className="flex flex-col">
      <div className="h-11 border-b border-border bg-surface-sunken" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-10 items-center gap-6 border-b border-border px-4 last:border-b-0">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </Panel>
);
