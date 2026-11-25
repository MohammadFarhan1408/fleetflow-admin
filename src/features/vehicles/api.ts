import { queryOptions } from "@tanstack/react-query";

import type { components } from "@/generated/api";
import type { PageSize } from "@/components/shared/CursorPagination";
import { apiClient, unwrap } from "@/lib/api/client";

export type Vehicle = components["schemas"]["Vehicle"];
export type VehicleStatus = components["schemas"]["VehicleStatusEnum"];
export type LicenseCategory = components["schemas"]["LicenseCategoryEnum"];

export type VehicleListFilters = {
  cursor: string | null;
  pageSize: PageSize;
  search: string;
  status: VehicleStatus | null;
  licenseCategory: LicenseCategory | null;
  /** `true` = only available, `false` = only unavailable, `null` = both. */
  available: boolean | null;
  includeArchived: boolean;
};

// architecture §6: query keys [module, 'list', filters] / [module, 'detail', id].
export const vehiclesQueries = {
  list: (filters: VehicleListFilters) =>
    queryOptions({
      queryKey: ["vehicles", "list", filters],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/vehicles/", {
            params: {
              query: {
                cursor: filters.cursor ?? undefined,
                page_size: filters.pageSize,
                search: filters.search || undefined,
                status: filters.status ?? undefined,
                license_category: filters.licenseCategory ?? undefined,
                available: filters.available ?? undefined,
                include_archived: filters.includeArchived || undefined,
              },
            },
          }),
        ),
    }),
  detail: (publicId: string) =>
    queryOptions({
      queryKey: ["vehicles", "detail", publicId],
      queryFn: () =>
        unwrap(apiClient.GET("/api/v1/vehicles/{public_id}/", { params: { path: { public_id: publicId } } })),
    }),
};
