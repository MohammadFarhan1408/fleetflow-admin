"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IdCardIcon } from "lucide-react";

import { CursorPagination } from "@/components/shared/CursorPagination";
import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListEmptyState } from "@/components/shared/ListEmptyState";
import { cursorFrom } from "@/lib/api/client";
import { ROUTES } from "@/lib/routes";
import { driversQueries } from "../api";
import { DRIVER_FILTER_PARAMS, readDriverFilters } from "../params";
import { driverColumns } from "./drivers-columns";
import { DriversFilters } from "./DriversFilters";

export const DriversTable = () => {
  const filters = readDriverFilters(useSearchParams());
  const query = useQuery(driversQueries.list(filters));
  const filtered =
    Boolean(filters.search) ||
    filters.status !== null ||
    filters.available !== null ||
    filters.date !== null ||
    filters.includeArchived;

  return (
    <div className="flex flex-col gap-4">
      <DriversFilters date={filters.date} />
      <DataTable
        caption="Drivers"
        columns={driverColumns(filters.date)}
        rows={query.data?.results}
        getRowId={(driver) => driver.public_id}
        loading={query.isPending}
        skeletonRows={Math.min(filters.pageSize, 10)}
        error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
        empty={
          <ListEmptyState
            icon={IdCardIcon}
            plural="drivers"
            basePath={ROUTES.drivers}
            pastEnd={Boolean(filters.cursor)}
            filtered={filtered}
            filterParams={DRIVER_FILTER_PARAMS}
            filteredHint="Try a different name or email, or change the filters."
            emptyDescription="Drivers who deliver for you appear here."
          />
        }
        footer={
          query.isSuccess && (
            <CursorPagination
              previousCursor={cursorFrom(query.data.previous)}
              nextCursor={cursorFrom(query.data.next)}
              pageSize={filters.pageSize}
            />
          )
        }
      />
    </div>
  );
};
