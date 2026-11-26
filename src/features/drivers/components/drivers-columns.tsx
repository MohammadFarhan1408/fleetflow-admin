import Link from "next/link";

import { AvailabilityText } from "@/components/shared/AvailabilityText";
import type { Column } from "@/components/shared/DataTable";
import { formatCalendarDate } from "@/lib/format";
import { driverPath } from "@/lib/routes";
import type { Driver } from "../api";
import { UNAVAILABLE_REASON_LABELS } from "../labels";
import { DriverStatus } from "./DriverStatus";

/** `date` is the day the list is evaluated for (`null` = today), so the header says which day "Availability" means. */
export const driverColumns = (date: string | null): Column<Driver>[] => [
  {
    id: "driver",
    header: "Driver",
    cell: (driver) => (
      <div className="flex flex-col">
        <Link href={driverPath(driver.public_id)} className="text-body-strong text-primary hover:underline">
          {driver.user.full_name}
        </Link>
        <span className="text-caption text-text-secondary">{driver.user.email}</span>
      </div>
    ),
  },
  { id: "phone", header: "Phone", cell: (driver) => <span className="tabular-nums">{driver.phone}</span> },
  { id: "branch", header: "Branch", cell: (driver) => driver.branch.name },
  { id: "status", header: "Status", cell: (driver) => <DriverStatus driver={driver} /> },
  {
    id: "availability",
    header: date ? `Availability on ${formatCalendarDate(date)}` : "Availability today",
    cell: (driver) => <AvailabilityText availability={driver.availability} labels={UNAVAILABLE_REASON_LABELS} />,
  },
];
