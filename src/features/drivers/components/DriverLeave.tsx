"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarOffIcon, PlusIcon } from "lucide-react";

import { CursorPagination, readPagination } from "@/components/shared/CursorPagination";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/features/session/SessionContext";
import { cursorFrom } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/permissions";
import { driversQueries, type DriverLeave as Leave } from "../api";
import { AddLeaveDialog } from "./AddLeaveDialog";
import { LeaveActions } from "./LeaveActions";
import { LEAVE_COLUMNS } from "./leave-columns";

/**
 * A driver's leave, in the API's order (newest added first; it has no date order or filter, API request in
 * memory.md). It loads on its own, so a failure here leaves the rest of the page usable.
 */
export const DriverLeave = ({
  driverId,
  driverName,
  archived,
}: {
  driverId: string;
  driverName: string;
  archived: boolean;
}) => {
  const paging = readPagination(useSearchParams());
  const query = useQuery(driversQueries.leave(driverId, paging));
  const [adding, setAdding] = useState(false);
  const { can } = usePermissions();
  // Archived drivers can't be changed (API 409), so their leave is read-only.
  const canManage = can(PERMISSIONS.fleetManage) && !archived;
  const addButton = (
    <Button variant={query.data?.results.length === 0 ? "primary" : "secondary"} onClick={() => setAdding(true)}>
      <PlusIcon />
      Add leave
    </Button>
  );
  const columns: Column<Leave>[] = canManage
    ? [
        ...LEAVE_COLUMNS,
        {
          id: "actions",
          header: "Actions",
          align: "end",
          cell: (leave) => <LeaveActions driverId={driverId} leave={leave} />,
        },
      ]
    : LEAVE_COLUMNS;

  return (
    <section aria-labelledby="leave-heading" className="flex flex-col gap-3 xl:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="leave-heading" className="text-h3 text-text">
          Leave
        </h2>
        {canManage && query.data && query.data.results.length > 0 && addButton}
      </div>
      <DataTable
        caption="Leave"
        columns={columns}
        rows={query.data?.results}
        getRowId={(leave) => leave.public_id}
        loading={query.isPending}
        skeletonRows={3}
        error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
        empty={
          <EmptyState
            icon={CalendarOffIcon}
            title={paging.cursor ? "No more leave" : "No leave recorded"}
            description={
              paging.cursor ? "This page is past the end of the list." : "Periods this driver is away appear here."
            }
            action={canManage && !paging.cursor ? addButton : undefined}
          />
        }
        footer={
          query.isSuccess &&
          (query.data.next || query.data.previous) && (
            <CursorPagination
              previousCursor={cursorFrom(query.data.previous)}
              nextCursor={cursorFrom(query.data.next)}
              pageSize={paging.pageSize}
            />
          )
        }
      />
      <AddLeaveDialog driverId={driverId} driverName={driverName} open={adding} onOpenChange={setAdding} />
    </section>
  );
};
