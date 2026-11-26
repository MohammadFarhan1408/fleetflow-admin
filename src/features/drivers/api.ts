import { queryOptions } from "@tanstack/react-query";

import type { components } from "@/generated/api";
import type { PageSize } from "@/components/shared/CursorPagination";
import { apiClient, unwrap } from "@/lib/api/client";

export type Driver = components["schemas"]["Driver"];
export type DriverStatus = components["schemas"]["DriverStatusEnum"];
export type DriverUnavailableReason = components["schemas"]["DriverUnavailableReasonEnum"];
export type DriverLeave = components["schemas"]["Leave"];

export type DriverListFilters = {
  cursor: string | null;
  pageSize: PageSize;
  search: string;
  status: DriverStatus | null;
  /** `true` = only available, `false` = only unavailable, `null` = both. */
  available: boolean | null;
  /** `YYYY-MM-DD` to evaluate availability for; `null` = today in the company timezone (the API's default). */
  date: string | null;
  includeArchived: boolean;
};

// architecture §6: query keys [module, 'list', filters] / [module, 'detail', id].
export const driversQueries = {
  list: (filters: DriverListFilters) =>
    queryOptions({
      queryKey: ["drivers", "list", filters],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/drivers/", {
            params: {
              query: {
                cursor: filters.cursor ?? undefined,
                page_size: filters.pageSize,
                search: filters.search || undefined,
                status: filters.status ?? undefined,
                available: filters.available ?? undefined,
                availability_date: filters.date ?? undefined,
                include_archived: filters.includeArchived || undefined,
              },
            },
          }),
        ),
    }),
  detail: (publicId: string, date: string | null) =>
    queryOptions({
      queryKey: ["drivers", "detail", publicId, date],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/drivers/{public_id}/", {
            params: { path: { public_id: publicId }, query: { availability_date: date ?? undefined } },
          }),
        ),
    }),
  leave: (publicId: string, paging: { cursor: string | null; pageSize: PageSize }) =>
    queryOptions({
      queryKey: ["drivers", "leave", publicId, paging],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/drivers/{driver_id}/leave/", {
            params: {
              path: { driver_id: publicId },
              query: { cursor: paging.cursor ?? undefined, page_size: paging.pageSize },
            },
          }),
        ),
    }),
};
