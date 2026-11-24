import { queryOptions } from "@tanstack/react-query";

import type { components } from "@/generated/api";
import { apiClient, unwrap } from "@/lib/api/client";

export type User = components["schemas"]["User"];

// architecture §6: query keys [module, 'list', filters] / [module, 'detail', id].
export const usersQueries = {
  list: ({ cursor, pageSize }: { cursor: string | null; pageSize: number }) =>
    queryOptions({
      queryKey: ["users", "list", { cursor, pageSize }],
      queryFn: () =>
        unwrap(
          apiClient.GET("/api/v1/users/", { params: { query: { cursor: cursor ?? undefined, page_size: pageSize } } }),
        ),
    }),
  detail: (publicId: string) =>
    queryOptions({
      queryKey: ["users", "detail", publicId],
      queryFn: () => unwrap(apiClient.GET("/api/v1/users/{public_id}/", { params: { path: { public_id: publicId } } })),
    }),
};
