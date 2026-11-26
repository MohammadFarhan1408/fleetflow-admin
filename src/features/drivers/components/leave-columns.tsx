import type { Column } from "@/components/shared/DataTable";
import { formatCalendarDate, formatDate } from "@/lib/format";
import type { DriverLeave } from "../api";
import { leaveDays } from "../leave";

export const LEAVE_COLUMNS: Column<DriverLeave>[] = [
  { id: "from", header: "From", cell: (leave) => formatCalendarDate(leave.starts_on) },
  { id: "to", header: "To", cell: (leave) => formatCalendarDate(leave.ends_on) },
  {
    id: "days",
    header: "Days",
    align: "end",
    cell: (leave) => leaveDays(leave.starts_on, leave.ends_on),
  },
  { id: "reason", header: "Reason", cell: (leave) => leave.reason },
  { id: "added", header: "Added", cell: (leave) => formatDate(leave.created_at) },
];
