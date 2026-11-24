import type { Column } from "@/components/shared/DataTable";
import { EmptyValue } from "@/components/shared/EmptyValue";
import type { CustomerAddress } from "../api";
import { formatAddress } from "../format-address";
import { ArchiveStatus } from "./CustomerStatus";

export const ADDRESS_COLUMNS: Column<CustomerAddress>[] = [
  { id: "label", header: "Label", cell: (address) => <span className="text-body-strong">{address.label || "—"}</span> },
  { id: "address", header: "Address", cell: (address) => formatAddress(address) },
  { id: "contact", header: "Contact", cell: (address) => address.contact_name || <EmptyValue /> },
  { id: "phone", header: "Phone", cell: (address) => address.phone || <EmptyValue /> },
  {
    id: "location",
    header: "Location",
    cell: (address) =>
      address.latitude !== null && address.longitude !== null ? (
        <span className="tabular-nums">
          {address.latitude}, {address.longitude}
        </span>
      ) : (
        <span className="text-muted">Not set</span>
      ),
  },
  { id: "status", header: "Status", cell: (address) => <ArchiveStatus archivedAt={address.archived_at} /> },
];
