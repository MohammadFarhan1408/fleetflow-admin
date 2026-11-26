"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TruckIcon } from "lucide-react";

import { CursorPagination } from "@/components/shared/CursorPagination";
import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListEmptyState } from "@/components/shared/ListEmptyState";
import { cursorFrom } from "@/lib/api/client";
import { ROUTES } from "@/lib/routes";
import { vehiclesQueries } from "../api";
import { readVehicleFilters, VEHICLE_FILTER_PARAMS } from "../params";
import { VEHICLE_COLUMNS } from "./vehicles-columns";
import { VehiclesFilters } from "./VehiclesFilters";

export const VehiclesTable = () => {
  const filters = readVehicleFilters(useSearchParams());
  const query = useQuery(vehiclesQueries.list(filters));
  const filtered =
    Boolean(filters.search) ||
    filters.status !== null ||
    filters.licenseCategory !== null ||
    filters.available !== null ||
    filters.includeArchived;

  return (
    <div className="flex flex-col gap-4">
      <VehiclesFilters />
      <DataTable
        caption="Vehicles"
        columns={VEHICLE_COLUMNS}
        rows={query.data?.results}
        getRowId={(vehicle) => vehicle.public_id}
        loading={query.isPending}
        skeletonRows={Math.min(filters.pageSize, 10)}
        error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
        empty={
          <ListEmptyState
            icon={TruckIcon}
            plural="vehicles"
            basePath={ROUTES.vehicles}
            pastEnd={Boolean(filters.cursor)}
            filtered={filtered}
            filterParams={VEHICLE_FILTER_PARAMS}
            filteredHint="Try a different registration, or change the filters."
            emptyDescription="Trucks and vans in your fleet appear here."
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
