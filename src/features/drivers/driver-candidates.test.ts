import { QueryClient } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw";
import { buildDriver } from "@/test/drivers";
import { buildUser } from "@/test/users";
import { driverCandidatesQuery } from "./driver-candidates";

const USERS = "*/bff/api/v1/users/";
const DRIVERS = "*/bff/api/v1/drivers/";
const load = () => new QueryClient().fetchQuery(driverCandidatesQuery);
const page = (results: unknown[], next: string | null = null) => HttpResponse.json({ results, next, previous: null });

describe("driverCandidatesQuery", () => {
  it("offers active users with the driver role who have no profile, archived profiles included", async () => {
    server.use(
      http.get(USERS, () =>
        page([
          buildUser({ public_id: "u-free", roles: ["driver"] }),
          buildUser({ public_id: "u-profiled", roles: ["driver"] }),
          buildUser({ public_id: "u-archived", roles: ["driver"] }),
          buildUser({ public_id: "u-inactive", roles: ["driver"], is_active: false }),
          buildUser({ public_id: "u-dispatcher", roles: ["dispatcher"] }),
        ]),
      ),
      http.get(DRIVERS, ({ request }) => {
        expect(new URL(request.url).searchParams.get("include_archived")).toBe("true");
        return page([
          buildDriver({ user: { public_id: "u-profiled", full_name: "A", email: "a@x.test" } }),
          buildDriver({
            user: { public_id: "u-archived", full_name: "B", email: "b@x.test" },
            archived_at: "2026-11-01T09:00:00Z",
          }),
        ]);
      }),
    );

    const { candidates, truncated } = await load();

    expect(candidates.map((user) => user.public_id)).toEqual(["u-free"]);
    expect(truncated).toBe(false);
  });

  it("follows the cursors, so a driver on a later page is still found", async () => {
    server.use(
      http.get(USERS, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        return cursor
          ? page([buildUser({ public_id: "u-2", roles: ["driver"] })])
          : page([buildUser({ public_id: "u-1", roles: ["driver"] })], "http://api.test/api/v1/users/?cursor=c2");
      }),
      http.get(DRIVERS, () => page([])),
    );

    const { candidates } = await load();

    expect(candidates.map((user) => user.public_id)).toEqual(["u-1", "u-2"]);
  });

  it("says when it stopped before the end of the list", async () => {
    server.use(
      http.get(USERS, () => page([buildUser({ roles: ["driver"] })], "http://api.test/api/v1/users/?cursor=more")),
      http.get(DRIVERS, () => page([])),
    );

    expect((await load()).truncated).toBe(true);
  });
});
