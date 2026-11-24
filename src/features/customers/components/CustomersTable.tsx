"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { CursorPagination, readPagination } from "@/components/shared/CursorPagination";
import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { readSearch } from "@/components/shared/SearchInput";
import { cursorFrom } from "@/lib/api/client";
import { customersQueries } from "../api";
import { ARCHIVED_PARAM } from "../params";
import { CUSTOMER_COLUMNS } from "./customers-columns";
import { CustomersEmptyState } from "./CustomersEmptyState";
import { CustomersFilters } from "./CustomersFilters";

export const CustomersTable = () => {
  const searchParams = useSearchParams();
  const { cursor, pageSize } = readPagination(searchParams);
  const search = readSearch(searchParams);
  const includeArchived = searchParams.get(ARCHIVED_PARAM) === "true";
  const query = useQuery(customersQueries.list({ cursor, pageSize, search, includeArchived }));

  return (
    <div className="flex flex-col gap-4">
      <CustomersFilters />
      <DataTable
        caption="Customers"
        columns={CUSTOMER_COLUMNS}
        rows={query.data?.results}
        getRowId={(customer) => customer.public_id}
        loading={query.isPending}
        skeletonRows={Math.min(pageSize, 10)}
        error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
        empty={<CustomersEmptyState pastEnd={Boolean(cursor)} filtered={Boolean(search) || includeArchived} />}
        footer={
          query.isSuccess && (
            <CursorPagination
              previousCursor={cursorFrom(query.data.previous)}
              nextCursor={cursorFrom(query.data.next)}
              pageSize={pageSize}
            />
          )
        }
      />
    </div>
  );
};
