import Link from "next/link";

import type { Column } from "@/components/shared/DataTable";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { formatDate } from "@/lib/format";
import { customerPath } from "@/lib/routes";
import type { Customer } from "../api";
import { CustomerKind } from "./CustomerKind";
import { ArchiveStatus } from "./CustomerStatus";

export const CUSTOMER_COLUMNS: Column<Customer>[] = [
  {
    id: "name",
    header: "Name",
    cell: (customer) => (
      <Link href={customerPath(customer.public_id)} className="text-body-strong text-primary hover:underline">
        {customer.name}
      </Link>
    ),
  },
  { id: "kind", header: "Type", cell: (customer) => <CustomerKind kind={customer.kind} /> },
  {
    id: "email",
    header: "Email",
    cell: (customer) =>
      customer.email ? <span className="text-text-secondary">{customer.email}</span> : <EmptyValue />,
  },
  { id: "phone", header: "Phone", cell: (customer) => customer.phone || <EmptyValue /> },
  { id: "status", header: "Status", cell: (customer) => <ArchiveStatus archivedAt={customer.archived_at} /> },
  { id: "created", header: "Added", cell: (customer) => formatDate(customer.created_at) },
];
