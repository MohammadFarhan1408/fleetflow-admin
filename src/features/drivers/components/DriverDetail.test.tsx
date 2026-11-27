import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildDriver, buildLeave } from "@/test/drivers";
import { DriverDetail } from "./DriverDetail";

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
  usePathname: () => "/fleet/drivers/d-1",
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
}));

const DRIVER = "*/bff/api/v1/drivers/:id/";
const LEAVE = "*/bff/api/v1/drivers/:id/leave/";
const VIEW = { permissions: ["fleet.view"] };
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });
const leavePage = (
  results: ReturnType<typeof buildLeave>[],
  next: string | null = null,
  previous: string | null = null,
) => HttpResponse.json({ results, next, previous });

describe("DriverDetail", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
    server.use(http.get(LEAVE, () => leavePage([])));
  });

  it("shows the driver, their status and availability, and the record", async () => {
    server.use(
      http.get(DRIVER, ({ params, request }) => {
        expect(params.id).toBe("d-1");
        expect(new URL(request.url).searchParams.has("availability_date")).toBe(false);
        return HttpResponse.json(buildDriver());
      }),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByRole("heading", { level: 1, name: "Dana Driver" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "dana.driver@example.test" })).toHaveAttribute(
      "href",
      "mailto:dana.driver%40example.test",
    );
    expect(screen.getByRole("link", { name: "+4915112345678" })).toHaveAttribute("href", "tel:+4915112345678");
    expect(screen.getByText("DD")).toBeInTheDocument();
    expect(screen.getByText("Berlin depot")).toBeInTheDocument();
    expect(screen.getByText("BER")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Availability on .*2026/ })).toHaveTextContent("Available");
    expect(screen.getByRole("button", { name: /^Availability on: .*2026/ })).toBeInTheDocument();
    expect(screen.queryByText("Reason given:")).not.toBeInTheDocument();
    expect(screen.queryByText("Archived")).not.toBeInTheDocument();
  });

  it("explains a suspended driver: the reason given and what blocks them on the day", async () => {
    server.use(
      http.get(DRIVER, () =>
        HttpResponse.json(
          buildDriver({
            status: "suspended",
            status_reason: "Missed medical check",
            availability: { date: "2026-11-26", available: false, reasons: ["suspended", "license_missing"] },
          }),
        ),
      ),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    const reason = (await screen.findByText("Missed medical check")).closest("p")!;
    expect(reason).toHaveTextContent("Reason given: Missed medical check");
    const reasons = within(screen.getByRole("list", { name: "Reasons" }));
    expect(reasons.getByText("Suspended")).toBeInTheDocument();
    expect(reasons.getByText("No licence on file")).toBeInTheDocument();
  });

  it("shows an archived driver as archived, with the date", async () => {
    server.use(
      http.get(DRIVER, () =>
        HttpResponse.json(
          buildDriver({
            archived_at: "2026-11-10T09:00:00Z",
            availability: { date: "2026-11-26", available: false, reasons: ["archived"] },
          }),
        ),
      ),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    await screen.findByRole("heading", { level: 1, name: "Dana Driver" });
    expect(screen.getAllByText("Archived")).toHaveLength(2); // the status badge and the reason chip
    expect(screen.getByText(/· Archived /)).toBeInTheDocument(); // the record line carries the date
  });

  it("asks for the availability on the chosen day and says which day it is", async () => {
    navigation.search = "date=2026-12-03";
    server.use(
      http.get(DRIVER, ({ request }) => {
        expect(new URL(request.url).searchParams.get("availability_date")).toBe("2026-12-03");
        return HttpResponse.json(
          buildDriver({ availability: { date: "2026-12-03", available: false, reasons: ["on_leave"] } }),
        );
      }),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("On leave")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Availability on .*2026/ })).toHaveTextContent("Unavailable");
    expect(
      screen.getByRole("button", { name: /^Availability on: .*3.*2026|^Availability on: .*2026.*/ }),
    ).toBeInTheDocument();
  });

  it("puts a chosen day in the URL, and clearing it goes back to today", async () => {
    server.use(http.get(DRIVER, () => HttpResponse.json(buildDriver())));
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);
    await userEvent.click(await screen.findByRole("button", { name: /^Availability on:/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Today" }));

    expect(navigation.replace).toHaveBeenLastCalledWith("/fleet/drivers/d-1", { scroll: false });
  });

  it("lists leave with the days counted, both ends included, and the dates the API sent", async () => {
    server.use(
      http.get(DRIVER, () => HttpResponse.json(buildDriver())),
      http.get(LEAVE, ({ params, request }) => {
        expect(params.id).toBe("d-1");
        expect(new URL(request.url).searchParams.get("page_size")).toBe("25");
        return leavePage([
          buildLeave(),
          buildLeave({ public_id: "l-2", starts_on: "2026-12-24", ends_on: "2026-12-24", reason: "Appointment" }),
        ]);
      }),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("Annual leave")).toBeInTheDocument();
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]!).getByText("5")).toBeInTheDocument();
    expect(within(rows[0]!).getByText(/\b1\b.*2026/)).toBeInTheDocument();
    expect(within(rows[1]!).getByText("1")).toBeInTheDocument();
  });

  it("says so when there is no leave", async () => {
    server.use(http.get(DRIVER, () => HttpResponse.json(buildDriver())));
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("No leave recorded")).toBeInTheDocument();
  });

  it("keeps the rest of the page when only the leave fails, and retries it", async () => {
    let calls = 0;
    server.use(
      http.get(DRIVER, () => HttpResponse.json(buildDriver())),
      http.get(LEAVE, () => {
        calls += 1;
        return calls === 1 ? apiError(500, "server_error") : leavePage([buildLeave()]);
      }),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("Reference: req-9")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Dana Driver" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Annual leave")).toBeInTheDocument();
  });

  it("pages leave with the cursors the API sends", async () => {
    navigation.search = "cursor=cur-2";
    server.use(
      http.get(DRIVER, () => HttpResponse.json(buildDriver())),
      http.get(LEAVE, ({ request }) => {
        expect(new URL(request.url).searchParams.get("cursor")).toBe("cur-2");
        return leavePage(
          [buildLeave()],
          "http://api.test/api/v1/drivers/d-1/leave/?cursor=cur-3",
          "http://api.test/api/v1/drivers/d-1/leave/?cursor=cur-1",
        );
      }),
    );
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/fleet/drivers/d-1?cursor=cur-3",
    );
    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
  });

  it.each([404, 400])("says not found when the API answers %i (another branch's driver)", async (status) => {
    server.use(http.get(DRIVER, () => apiError(status, "not_found")));
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("Driver not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to drivers" })).toHaveAttribute("href", "/fleet/drivers");
  });

  it("shows a retryable error with the request ID for other failures", async () => {
    server.use(http.get(DRIVER, () => apiError(500, "server_error")));
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("Reference: req-9")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("does not show a driver when the API refuses access", async () => {
    server.use(http.get(DRIVER, () => apiError(403, "permission.denied")));
    renderInConsole(<DriverDetail publicId="d-1" />, VIEW);

    expect(await screen.findByText("You don't have access to this")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});
