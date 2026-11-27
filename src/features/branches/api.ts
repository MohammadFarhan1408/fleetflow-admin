import { queryOptions } from "@tanstack/react-query";

import type { components } from "@/generated/api";
import { apiClient, unwrap } from "@/lib/api/client";

export type Branch = components["schemas"]["Branch"];

/** ponytail: one page of 100 branches, no pager. A company has a handful; add one if a company ever has more. */
const PAGE_SIZE = 100;

/**
 * The branches the caller can pick for a driver, vehicle, shipment or route: their own, or every branch of the company
 * for a user who may work across branches (the API decides). `/me` lists only the user's own.
 */
export const branchesQueries = {
  list: () =>
    queryOptions({
      queryKey: ["branches", "list"],
      queryFn: async () =>
        (await unwrap(apiClient.GET("/api/v1/branches/", { params: { query: { page_size: PAGE_SIZE } } }))).results,
    }),
};
