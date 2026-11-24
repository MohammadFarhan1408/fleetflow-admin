import { queryOptions } from "@tanstack/react-query";

import type { components } from "@/generated/api";
import { apiClient, unwrap } from "@/lib/api/client";

export type Customer = components["schemas"]["Customer"];
export type CustomerAddress = components["schemas"]["Address"];

export type CustomerListFilters = { cursor: string | null; pageSize: number; search: string; includeArchived: boolean };

// The addresses card shows one page; the API caps page_size at 100.
export const ADDRESS_PAGE_SIZE = 100;

// architecture §6: query keys [module, 'list', filters] / [module, 'detail', id].
export const customersQueries = {
  list: (filters: CustomerListFilters) =>
    queryOptions({
      queryKey: ["customers", "list", filters],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/customers/", {
            params: {
              query: {
                cursor: filters.cursor ?? undefined,
                page_size: filters.pageSize,
                search: filters.search || undefined,
                include_archived: filters.includeArchived || undefined,
              },
            },
          }),
        ),
    }),
  detail: (publicId: string) =>
    queryOptions({
      queryKey: ["customers", "detail", publicId],
      queryFn: () =>
        unwrap(apiClient.GET("/api/v1/customers/{public_id}/", { params: { path: { public_id: publicId } } })),
    }),
  addresses: (customerId: string, includeArchived: boolean) =>
    queryOptions({
      queryKey: ["customers", "addresses", customerId, { includeArchived }],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/customers/{customer_id}/addresses/", {
            params: {
              path: { customer_id: customerId },
              query: { page_size: ADDRESS_PAGE_SIZE, include_archived: includeArchived || undefined },
            },
          }),
        ),
    }),
};
