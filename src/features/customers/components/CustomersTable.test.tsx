import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildCustomer } from "@/test/customers";
import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { CustomersTable } from "./CustomersTable";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: (() => {
    let cached: { key: string; params: URLSearchParams } | null = null;
    return () => {
      if (cached?.key !== navigation.search)
        cached = { key: navigation.search, params: new URLSearchParams(navigation.search) };
      return cached.params;
    };
  })(),
  usePathname: () => "/customers",
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
}));

const CUSTOMERS = "*/bff/api/v1/customers/";
const page = (
  results: ReturnType<typeof buildCustomer>[],
  next: string | null = null,
  previous: string | null = null,
) => HttpResponse.json({ results, next, previous });

describe("CustomersTable", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
    navigation.push.mockReset();
  });

  it("shows a skeleton, then one row per customer with a link to the detail page", async () => {
    server.use(
      http.get(CUSTOMERS, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("page_size")).toBe("25");
        expect(params.has("search")).toBe(false);
        expect(params.has("include_archived")).toBe(false);
        return page([
          buildCustomer(),
          buildCustomer({
            public_id: "c-2",
            kind: "individual",
            name: "Ada Lovelace",
            email: "",
            phone: "",
            archived_at: "2026-11-10T09:00:00Z",
          }),
        ]);
      }),
    );
    renderWithQuery(<CustomersTable />);

    expect(screen.getByRole("table", { name: "Customers" })).toHaveAttribute("aria-busy", "true");

    const link = await screen.findByRole("link", { name: "Northwind Traders" });
    expect(link).toHaveAttribute("href", "/customers/c-0001");
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("Business")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("ops@northwind.test")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Active")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Individual")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Archived")).toBeInTheDocument();
    expect(within(rows[1]!).getAllByText("—")).toHaveLength(2);
  });

  it("sends the search term and the archived flag from the URL", async () => {
    navigation.search = "search=north&archived=true";
    server.use(
      http.get(CUSTOMERS, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("search")).toBe("north");
        expect(params.get("include_archived")).toBe("true");
        return page([buildCustomer()]);
      }),
    );
    renderWithQuery(<CustomersTable />);

    expect(await screen.findByRole("link", { name: "Northwind Traders" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search customers" })).toHaveValue("north");
    expect(screen.getByRole("switch", { name: "Show archived" })).toBeChecked();
  });

  it("puts the archived toggle in the URL and returns to the first page", async () => {
    navigation.search = "cursor=abc";
    server.use(http.get(CUSTOMERS, () => page([buildCustomer()])));
    renderWithQuery(<CustomersTable />);

    await userEvent.click(await screen.findByRole("switch", { name: "Show archived" }));

    expect(navigation.replace).toHaveBeenCalledWith("/customers?archived=true", { scroll: false });
  });

  it("explains an empty customer list", async () => {
    server.use(http.get(CUSTOMERS, () => page([])));
    renderWithQuery(<CustomersTable />);

    expect(await screen.findByText("No customers yet")).toBeInTheDocument();
  });

  it("explains an empty search and offers to clear the filters", async () => {
    navigation.search = "search=zzz";
    server.use(http.get(CUSTOMERS, () => page([])));
    renderWithQuery(<CustomersTable />);

    expect(await screen.findByText("No customers match")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/customers");
  });

  it("shows an error with the request ID and recovers on retry", async () => {
    let calls = 0;
    server.use(
      http.get(CUSTOMERS, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ code: "server_error", detail: "x", request_id: "req-7" }, { status: 500 })
          : page([buildCustomer()]);
      }),
    );
    renderWithQuery(<CustomersTable />);

    expect(await screen.findByText("FleetFlow is unavailable")).toBeInTheDocument();
    expect(screen.getByText("Reference: req-7")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("link", { name: "Northwind Traders" })).toBeInTheDocument();
  });

  it("does not pretend to show customers when the API refuses access", async () => {
    server.use(
      http.get(CUSTOMERS, () =>
        HttpResponse.json({ code: "permission_denied", detail: "x", request_id: "r" }, { status: 403 }),
      ),
    );
    renderWithQuery(<CustomersTable />);

    expect(await screen.findByText("You don't have access to this")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("pages with cursors from the API links and keeps the filters in the page links", async () => {
    navigation.search = "search=north&cursor=cur-2";
    server.use(
      http.get(CUSTOMERS, ({ request }) => {
        expect(new URL(request.url).searchParams.get("cursor")).toBe("cur-2");
        return page(
          [buildCustomer()],
          "http://api.test/api/v1/customers/?cursor=cur-3",
          "http://api.test/api/v1/customers/?cursor=cur-1",
        );
      }),
    );
    renderWithQuery(<CustomersTable />);

    expect(await screen.findByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/customers?search=north&cursor=cur-3",
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/customers?search=north&cursor=cur-1",
    );
  });
});
