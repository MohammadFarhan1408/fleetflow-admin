import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { branchesHandler } from "@/test/branches";
import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { buildDriver } from "@/test/drivers";
import { DriversTable } from "./DriversTable";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: (() => {
    let cached: { key: string; params: URLSearchParams } | null = null;
    return () => {
      if (cached?.key !== navigation.search)
        cached = { key: navigation.search, params: new URLSearchParams(navigation.search) };
      return cached.params;
    };
  })(),
  usePathname: () => "/fleet/drivers",
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
}));

const HAM = "01a21e3d-8fc5-74dd-b20c-e5a72761d912";
const DRIVERS = "*/bff/api/v1/drivers/";
const page = (results: ReturnType<typeof buildDriver>[], next: string | null = null, previous: string | null = null) =>
  HttpResponse.json({ results, next, previous });

describe("DriversTable", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("sends the branch from the URL, ignores one that is not an id, and clears it with Clear all", async () => {
    const sent: (string | null)[] = [];
    server.use(
      branchesHandler(),
      http.get(DRIVERS, ({ request }) => {
        sent.push(new URL(request.url).searchParams.get("branch"));
        return page([buildDriver()]);
      }),
    );
    navigation.search = "branch=nope";
    const view = renderWithQuery(<DriversTable />);
    await screen.findByRole("link", { name: /./ });
    expect(sent).toEqual([null]);
    view.unmount();

    navigation.search = `branch=${HAM}`;
    renderWithQuery(<DriversTable />);
    await vi.waitFor(() => expect(sent).toEqual([null, HAM]));
    expect(await screen.findByRole("link", { name: "Clear all" })).toHaveAttribute("href", "/fleet/drivers");
  });

  it("shows a skeleton, then a row per driver with a link to their page, and asks for nothing extra", async () => {
    server.use(
      http.get(DRIVERS, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("page_size")).toBe("25");
        for (const name of ["search", "status", "available", "availability_date", "include_archived"]) {
          expect(params.has(name)).toBe(false);
        }
        return page([
          buildDriver(),
          buildDriver({
            public_id: "d-2",
            user: { public_id: "u-2", full_name: "Sam Suspended", email: "sam@example.test" },
            status: "suspended",
            availability: { date: "2026-11-26", available: false, reasons: ["suspended", "license_expired"] },
          }),
          buildDriver({
            public_id: "d-3",
            user: { public_id: "u-3", full_name: "Ari Archived", email: "ari@example.test" },
            archived_at: "2026-11-10T09:00:00Z",
            availability: {
              date: "2026-11-26",
              available: false,
              reasons: ["archived", "inspection_overdue" as never],
            }, // a reason newer than the generated enum,
          }),
        ]);
      }),
    );
    renderWithQuery(<DriversTable />);

    expect(screen.getByRole("table", { name: "Drivers" })).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("link", { name: "Dana Driver" })).toHaveAttribute("href", "/fleet/drivers/d-0001");
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText("dana.driver@example.test")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("+4915112345678")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Berlin depot")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Active")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Available")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Suspended")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Unavailable: Suspended, Licence expired")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("Archived")).toBeInTheDocument();
    // A reason from a later API version is shown humanized, not dropped.
    expect(within(rows[2]!).getByText("Unavailable: Archived, Inspection overdue")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Availability today" })).toBeInTheDocument();
  });

  it("sends every filter from the URL, and shows them as chosen", async () => {
    navigation.search = "search=dana&status=suspended&availability=unavailable&date=2026-12-01&archived=true";
    server.use(
      http.get(DRIVERS, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("search")).toBe("dana");
        expect(params.get("status")).toBe("suspended");
        expect(params.get("available")).toBe("false");
        expect(params.get("availability_date")).toBe("2026-12-01");
        expect(params.get("include_archived")).toBe("true");
        return page([buildDriver()]);
      }),
    );
    renderWithQuery(<DriversTable />);

    await screen.findByRole("link", { name: "Dana Driver" });
    expect(screen.getByRole("searchbox", { name: "Search drivers" })).toHaveValue("dana");
    expect(screen.getByRole("radio", { name: "Suspended" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Unavailable" })).toBeChecked();
    expect(screen.getByRole("button", { name: /^Availability on: .*2026/ })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Show archived" })).toBeChecked();
    expect(screen.getByRole("link", { name: "Clear all" })).toHaveAttribute("href", "/fleet/drivers");
    expect(screen.getByRole("columnheader", { name: /^Availability on / })).toHaveTextContent("2026");
  });

  it("ignores a date that is not a real day", async () => {
    navigation.search = "date=2026-02-30";
    server.use(
      http.get(DRIVERS, ({ request }) => {
        expect(new URL(request.url).searchParams.has("availability_date")).toBe(false);
        return page([buildDriver()]);
      }),
    );
    renderWithQuery(<DriversTable />);

    await screen.findByRole("link", { name: "Dana Driver" });
    expect(screen.getByRole("columnheader", { name: "Availability today" })).toBeInTheDocument();
  });

  it("puts a day chosen in the calendar in the URL and returns to the first page", async () => {
    navigation.search = "cursor=abc&status=active&date=2026-12-01";
    server.use(http.get(DRIVERS, () => page([buildDriver()])));
    renderWithQuery(<DriversTable />);
    await screen.findByRole("link", { name: "Dana Driver" });

    await userEvent.click(screen.getByRole("button", { name: /^Availability on:/ }));
    await userEvent.click(await screen.findByRole("button", { name: /2 December 2026|December 2, 2026/ }));

    expect(navigation.replace).toHaveBeenLastCalledWith("/fleet/drivers?status=active&date=2026-12-02", {
      scroll: false,
    });
  });

  it("puts a chosen status in the URL and returns to the first page", async () => {
    navigation.search = "cursor=abc";
    server.use(http.get(DRIVERS, () => page([buildDriver()])));
    renderWithQuery(<DriversTable />);

    await userEvent.click(await screen.findByRole("radio", { name: "Suspended" }));

    expect(navigation.replace).toHaveBeenCalledWith("/fleet/drivers?status=suspended", { scroll: false });
  });

  it("explains an empty driver list", async () => {
    server.use(http.get(DRIVERS, () => page([])));
    renderWithQuery(<DriversTable />);

    expect(await screen.findByText("No drivers yet")).toBeInTheDocument();
  });

  it("explains filters that match nothing and clears all of them with one link", async () => {
    navigation.search = "search=zzz&status=active&availability=available&date=2026-12-01&archived=true";
    server.use(http.get(DRIVERS, () => page([])));
    renderWithQuery(<DriversTable />);

    expect(await screen.findByText("No drivers match")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/fleet/drivers");
  });

  it("shows an error with the request ID and recovers on retry", async () => {
    let calls = 0;
    server.use(
      http.get(DRIVERS, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ code: "server_error", detail: "x", request_id: "req-7" }, { status: 500 })
          : page([buildDriver()]);
      }),
    );
    renderWithQuery(<DriversTable />);

    expect(await screen.findByText("Reference: req-7")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("link", { name: "Dana Driver" })).toBeInTheDocument();
  });

  it("does not pretend to show drivers when the API refuses access", async () => {
    server.use(
      http.get(DRIVERS, () =>
        HttpResponse.json({ code: "permission.denied", detail: "x", request_id: "r" }, { status: 403 }),
      ),
    );
    renderWithQuery(<DriversTable />);

    expect(await screen.findByText("You don't have access to this")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("pages with cursors from the API links and keeps the filters in the page links", async () => {
    navigation.search = "status=active&date=2026-12-01&cursor=cur-2";
    server.use(
      http.get(DRIVERS, ({ request }) => {
        expect(new URL(request.url).searchParams.get("cursor")).toBe("cur-2");
        return page(
          [buildDriver()],
          "http://api.test/api/v1/drivers/?cursor=cur-3",
          "http://api.test/api/v1/drivers/?cursor=cur-1",
        );
      }),
    );
    renderWithQuery(<DriversTable />);

    expect(await screen.findByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/fleet/drivers?status=active&date=2026-12-01&cursor=cur-3",
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/fleet/drivers?status=active&date=2026-12-01&cursor=cur-1",
    );
  });
});
