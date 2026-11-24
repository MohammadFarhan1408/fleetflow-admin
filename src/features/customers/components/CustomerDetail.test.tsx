import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { buildAddress, buildCustomer } from "@/test/customers";
import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { CustomerDetail } from "./CustomerDetail";

const DETAIL = "*/bff/api/v1/customers/:id/";
const ADDRESSES = "*/bff/api/v1/customers/:id/addresses/";
const page = (results: ReturnType<typeof buildAddress>[], next: string | null = null) =>
  HttpResponse.json({ results, next, previous: null });

describe("CustomerDetail", () => {
  it("shows the customer's contact details and addresses", async () => {
    server.use(
      http.get(DETAIL, ({ params }) => {
        expect(params.id).toBe("c-1");
        return HttpResponse.json(buildCustomer());
      }),
      http.get(ADDRESSES, ({ params, request }) => {
        expect(params.id).toBe("c-0001");
        expect(new URL(request.url).searchParams.has("include_archived")).toBe(false);
        return page([
          buildAddress(),
          buildAddress({
            public_id: "a-2",
            label: "Depot",
            latitude: 52.52,
            longitude: 13.4,
            geocode_confidence: "manual",
          }),
        ]);
      }),
    );
    renderWithQuery(<CustomerDetail publicId="c-1" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Northwind Traders" })).toBeInTheDocument();
    expect(screen.getByText("ops@northwind.test")).toBeInTheDocument();

    await screen.findByText("Main warehouse");
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]!).getByText("Main warehouse")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Hafenstrasse 4, Berlin 10115, DE")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Not set")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("52.52, 13.4")).toBeInTheDocument();
  });

  it("asks for archived addresses when the customer is archived", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json(buildCustomer({ archived_at: "2026-11-10T09:00:00Z" }))),
      http.get(ADDRESSES, ({ request }) => {
        expect(new URL(request.url).searchParams.get("include_archived")).toBe("true");
        return page([buildAddress({ archived_at: "2026-11-10T09:00:00Z" })]);
      }),
    );
    renderWithQuery(<CustomerDetail publicId="c-1" />);

    expect(await screen.findByText("Main warehouse")).toBeInTheDocument();
    expect(screen.getAllByText("Archived").length).toBeGreaterThanOrEqual(2);
  });

  it("explains a customer without addresses", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json(buildCustomer())),
      http.get(ADDRESSES, () => page([])),
    );
    renderWithQuery(<CustomerDetail publicId="c-1" />);

    expect(await screen.findByText("No addresses yet")).toBeInTheDocument();
  });

  it("keeps the customer visible when only the addresses fail, with a retry", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json(buildCustomer())),
      http.get(ADDRESSES, () =>
        HttpResponse.json({ code: "server_error", detail: "x", request_id: "r" }, { status: 500 }),
      ),
    );
    renderWithQuery(<CustomerDetail publicId="c-1" />);

    expect(await screen.findByText("FleetFlow is unavailable")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Northwind Traders" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("shows a not-found state for a customer outside the company", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json({ code: "not_found", detail: "x", request_id: "r" }, { status: 404 })),
    );
    renderWithQuery(<CustomerDetail publicId="c-other" />);

    expect(await screen.findByText("Customer not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to customers" })).toHaveAttribute("href", "/customers");
  });
});
