import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { branchesHandler } from "@/test/branches";
import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { buildVehicle } from "@/test/vehicles";
import { VehiclesTable } from "./VehiclesTable";

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
  usePathname: () => "/fleet/vehicles",
  useRouter: () => ({ replace: navigation.replace, push: vi.fn() }),
}));

const HAM = "01a21e3d-8fc5-74dd-b20c-e5a72761d912";
const VEHICLES = "*/bff/api/v1/vehicles/";
const page = (results: ReturnType<typeof buildVehicle>[], next: string | null = null, previous: string | null = null) =>
  HttpResponse.json({ results, next, previous });

describe("VehiclesTable", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("shows a skeleton, then a row per vehicle with a link to its page", async () => {
    server.use(
      http.get(VEHICLES, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("page_size")).toBe("25");
        for (const name of ["search", "status", "license_category", "available", "include_archived"]) {
          expect(params.has(name)).toBe(false);
        }
        return page([
          buildVehicle(),
          buildVehicle({
            public_id: "v-2",
            registration_number: "B CD 99",
            make: "",
            model: "",
            status: "in_maintenance",
            availability: { date: "2026-11-26", available: false, reasons: ["in_maintenance"] },
          }),
          buildVehicle({ public_id: "v-3", registration_number: "B EF 5", archived_at: "2026-11-10T09:00:00Z" }),
        ]);
      }),
    );
    renderWithQuery(<VehiclesTable />);

    expect(screen.getByRole("table", { name: "Vehicles" })).toHaveAttribute("aria-busy", "true");

    expect(await screen.findByRole("link", { name: "B AB 1234" })).toHaveAttribute("href", "/fleet/vehicles/v-0001");
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText("Mercedes Sprinter")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Berlin depot")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("C1")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("1,500 kg · 12.5 m³")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Active")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Available")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("In maintenance")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Unavailable: In maintenance")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("—")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("Archived")).toBeInTheDocument();
  });

  it("sends every filter from the URL, and shows them as chosen", async () => {
    navigation.search = "search=B+AB&status=in_maintenance&license=C1E&availability=unavailable&archived=true";
    server.use(
      http.get(VEHICLES, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("search")).toBe("B AB");
        expect(params.get("status")).toBe("in_maintenance");
        expect(params.get("license_category")).toBe("C1E");
        expect(params.get("available")).toBe("false");
        expect(params.get("include_archived")).toBe("true");
        return page([buildVehicle()]);
      }),
    );
    renderWithQuery(<VehiclesTable />);

    await screen.findByRole("link", { name: "B AB 1234" });
    expect(screen.getByRole("searchbox", { name: "Search vehicles" })).toHaveValue("B AB");
    expect(screen.getByRole("radio", { name: "In maintenance" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Licence: C1E" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Unavailable" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Show archived" })).toBeChecked();
  });

  it("sends the branch from the URL, and clears it with Clear all", async () => {
    navigation.search = `branch=${HAM}&status=active`;
    let sent: string | null = null;
    server.use(
      branchesHandler(),
      http.get(VEHICLES, ({ request }) => {
        sent = new URL(request.url).searchParams.get("branch");
        return page([buildVehicle()]);
      }),
    );
    renderWithQuery(<VehiclesTable />);

    await screen.findByRole("link", { name: "B AB 1234" });
    expect(sent).toBe(HAM);
    expect(screen.getByRole("link", { name: "Clear all" })).toHaveAttribute("href", "/fleet/vehicles");
  });

  it("does not send a branch that is not an id, and explains a branch with no vehicles", async () => {
    navigation.search = "branch=nope";
    const sent: (string | null)[] = [];
    server.use(
      branchesHandler(),
      http.get(VEHICLES, ({ request }) => {
        sent.push(new URL(request.url).searchParams.get("branch"));
        return page([]);
      }),
    );
    const view = renderWithQuery(<VehiclesTable />);
    expect(await screen.findByText("No vehicles yet")).toBeInTheDocument();
    expect(sent).toEqual([null]);
    view.unmount();

    navigation.search = `branch=${HAM}`;
    renderWithQuery(<VehiclesTable />);
    expect(await screen.findByText("No vehicles match")).toBeInTheDocument();
  });

  it("puts a chosen filter in the URL and returns to the first page", async () => {
    navigation.search = "cursor=abc";
    server.use(http.get(VEHICLES, () => page([buildVehicle()])));
    renderWithQuery(<VehiclesTable />);

    await userEvent.click(await screen.findByRole("radio", { name: "Out of service" }));

    expect(navigation.replace).toHaveBeenCalledWith("/fleet/vehicles?status=out_of_service", { scroll: false });
  });

  it("explains an empty fleet", async () => {
    server.use(http.get(VEHICLES, () => page([])));
    renderWithQuery(<VehiclesTable />);

    expect(await screen.findByText("No vehicles yet")).toBeInTheDocument();
  });

  it("explains filters that match nothing and clears all of them with one link", async () => {
    navigation.search = "search=zzz&status=active&license=B&availability=available&archived=true";
    server.use(http.get(VEHICLES, () => page([])));
    renderWithQuery(<VehiclesTable />);

    expect(await screen.findByText("No vehicles match")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/fleet/vehicles");
  });

  it("shows an error with the request ID and recovers on retry", async () => {
    let calls = 0;
    server.use(
      http.get(VEHICLES, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ code: "server_error", detail: "x", request_id: "req-7" }, { status: 500 })
          : page([buildVehicle()]);
      }),
    );
    renderWithQuery(<VehiclesTable />);

    expect(await screen.findByText("Reference: req-7")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("link", { name: "B AB 1234" })).toBeInTheDocument();
  });

  it("does not pretend to show vehicles when the API refuses access", async () => {
    server.use(
      http.get(VEHICLES, () =>
        HttpResponse.json({ code: "permission.denied", detail: "x", request_id: "r" }, { status: 403 }),
      ),
    );
    renderWithQuery(<VehiclesTable />);

    expect(await screen.findByText("You don't have access to this")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("pages with cursors from the API links and keeps the filters in the page links", async () => {
    navigation.search = "status=active&cursor=cur-2";
    server.use(
      http.get(VEHICLES, ({ request }) => {
        expect(new URL(request.url).searchParams.get("cursor")).toBe("cur-2");
        return page(
          [buildVehicle()],
          "http://api.test/api/v1/vehicles/?cursor=cur-3",
          "http://api.test/api/v1/vehicles/?cursor=cur-1",
        );
      }),
    );
    renderWithQuery(<VehiclesTable />);

    expect(await screen.findByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/fleet/vehicles?status=active&cursor=cur-3",
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/fleet/vehicles?status=active&cursor=cur-1",
    );
  });
});
