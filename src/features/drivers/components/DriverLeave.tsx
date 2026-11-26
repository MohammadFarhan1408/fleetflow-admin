"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarOffIcon } from "lucide-react";

import { CursorPagination, readPagination } from "@/components/shared/CursorPagination";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { cursorFrom } from "@/lib/api/client";
import { driversQueries } from "../api";
import { LEAVE_COLUMNS } from "./leave-columns";

/**
 * A driver's leave, in the API's order (newest added first; it has no date order or filter, API request in
 * memory.md). It loads on its own, so a failure here leaves the rest of the page usable.
 */
export const DriverLeave = ({ driverId }: { driverId: string }) => {
  const paging = readPagination(useSearchParams());
  const query = useQuery(driversQueries.leave(driverId, paging));

  return (
    <section aria-labelledby="leave-heading" className="flex flex-col gap-3 xl:col-span-12">
      <h2 id="leave-heading" className="text-h3 text-text">
        Leave
      </h2>
      <DataTable
        caption="Leave"
        columns={LEAVE_COLUMNS}
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
    </section>
  );
};
