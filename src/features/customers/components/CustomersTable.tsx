"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ContactIcon } from "lucide-react";

import { ARCHIVED_PARAM, readIncludeArchived } from "@/components/shared/ArchivedToggle";
import { CursorPagination, readPagination } from "@/components/shared/CursorPagination";
import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListEmptyState } from "@/components/shared/ListEmptyState";
import { readSearch, SEARCH_PARAM } from "@/components/shared/SearchInput";
import { cursorFrom } from "@/lib/api/client";
import { ROUTES } from "@/lib/routes";
import { customersQueries } from "../api";
import { CUSTOMER_COLUMNS } from "./customers-columns";
import { CustomersFilters } from "./CustomersFilters";

export const CustomersTable = () => {
  const searchParams = useSearchParams();
  const { cursor, pageSize } = readPagination(searchParams);
  const search = readSearch(searchParams);
  const includeArchived = readIncludeArchived(searchParams);
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
        empty={
          <ListEmptyState
            icon={ContactIcon}
            plural="customers"
            basePath={ROUTES.customers}
            pastEnd={Boolean(cursor)}
            filtered={Boolean(search) || includeArchived}
            filterParams={[SEARCH_PARAM, ARCHIVED_PARAM]}
            filteredHint="Try a different name, or include archived customers."
            emptyDescription="Companies and people who ship with you appear here."
          />
        }
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
