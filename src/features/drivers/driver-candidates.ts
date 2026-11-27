import { queryOptions } from "@tanstack/react-query";

import { apiClient, cursorFrom, unwrap } from "@/lib/api/client";

const PAGE_SIZE = 100;
const MAX_PAGES = 5;

type Page<Item> = { results: Item[]; next?: string | null };

/** Every item of a cursor-paged list, up to `MAX_PAGES` pages; `truncated` says whether more were left behind. */
const collectPages = async <Item>(fetchPage: (cursor: string | undefined) => Promise<Page<Item>>) => {
  const items: Item[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchPage(cursor);
    items.push(...result.results);
    cursor = cursorFrom(result.next) ?? undefined;
    if (!cursor) return { items, truncated: false };
  }
  return { items, truncated: true };
};

/**
 * The users who can still get a driver profile: active, with the `driver` role, and no profile yet (an archived
 * driver keeps theirs, and the API allows one per user).
 *
 * ponytail: the API has no `GET /users/?role=` (memory.md API requests), so this pages through users and drivers
 * and filters here. It needs `users.view`, misses anyone past 500 users or drivers, and goes away when the filter
 * ships.
 */
export const driverCandidatesQuery = queryOptions({
  queryKey: ["drivers", "candidates"],
  queryFn: async () => {
    const [users, drivers] = await Promise.all([
      collectPages((cursor) =>
        unwrap(apiClient.GET("/api/v1/users/", { params: { query: { cursor, page_size: PAGE_SIZE } } })),
      ),
      collectPages((cursor) =>
        unwrap(
          apiClient.GET("/api/v1/drivers/", {
            params: { query: { cursor, page_size: PAGE_SIZE, include_archived: true } },
          }),
        ),
      ),
    ]);
    const profiled = new Set(drivers.items.map((driver) => driver.user.public_id));
    return {
      candidates: users.items.filter(
        (user) => user.is_active && user.roles.includes("driver") && !profiled.has(user.public_id),
      ),
      truncated: users.truncated || drivers.truncated,
    };
  },
});
