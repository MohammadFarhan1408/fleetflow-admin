import type { Column } from "@/components/shared/DataTable";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Badge } from "@/components/ui/Badge";
import { formatCalendarDate } from "@/lib/format";
import type { DocumentOwner, FleetDocument } from "../api";
import { documentExpiry } from "../expiry";
import { DOCUMENT_TYPE_LABELS } from "../labels";

/** `today` is the day "expires soon" is measured from. The number arrives only for users who may see it (the API's call). */
export const documentColumns = (owner: DocumentOwner, today: string): Column<FleetDocument>[] => [
  {
    id: "document",
    header: "Document",
    cell: (document) => (
      <div className="flex flex-col">
        <span className="text-body-strong">{DOCUMENT_TYPE_LABELS[document.type]}</span>
        {document.number && <span className="font-mono text-caption text-text-secondary">{document.number}</span>}
      </div>
    ),
  },
  ...(owner === "drivers"
    ? [
        {
          id: "categories",
          header: "Categories",
          cell: (document: FleetDocument) =>
            document.categories?.length ? (
              <ul aria-label="Categories" className="flex flex-wrap gap-1">
                {document.categories.map((category) => (
                  <li key={category}>
                    <Badge dot={false}>{category}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyValue />
            ),
        },
      ]
    : []),
  {
    id: "issued",
    header: "Issued",
    className: "whitespace-nowrap",
    cell: (document) => (document.issued_on ? formatCalendarDate(document.issued_on) : <EmptyValue />),
  },
  {
    id: "expires",
    header: "Expires",
    className: "whitespace-nowrap",
    cell: (document) => (document.expires_on ? formatCalendarDate(document.expires_on) : <EmptyValue />),
  },
  {
    id: "status",
    header: "Status",
    className: "whitespace-nowrap",
    cell: (document) => {
      const { tone, label } = documentExpiry(document, today);
      return <Badge tone={tone}>{label}</Badge>;
    },
  },
];
