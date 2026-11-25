import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { buildCustomer } from "@/test/customers";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { CustomerEdit } from "./CustomerEdit";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const DETAIL = "*/bff/api/v1/customers/:id/";
const MANAGER = { permissions: ["customers.manage"] };

describe("CustomerEdit", () => {
  it("shows a loading placeholder, then the form with the customer's values", async () => {
    server.use(http.get(DETAIL, () => HttpResponse.json(buildCustomer())));
    renderInConsole(<CustomerEdit publicId="c-0001" />, MANAGER);

    expect(screen.getByRole("status", { name: "Loading form" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1, name: "Edit Northwind Traders" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Company name" })).toHaveValue("Northwind Traders");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("replaces the form values when the customer is refetched with a newer version", async () => {
    let customer = buildCustomer();
    server.use(http.get(DETAIL, () => HttpResponse.json(customer)));
    const { client } = renderInConsole(<CustomerEdit publicId="c-0001" />, MANAGER);
    expect(await screen.findByRole("textbox", { name: "Company name" })).toHaveValue("Northwind Traders");

    customer = buildCustomer({ name: "Northwind Group", updated_at: "2026-11-25T10:00:00Z" });
    await client.invalidateQueries({ queryKey: ["customers", "detail", "c-0001"] });

    await waitFor(() => expect(screen.getByRole("textbox", { name: "Company name" })).toHaveValue("Northwind Group"));
  });

  it("does not offer a form for an archived customer", async () => {
    server.use(http.get(DETAIL, () => HttpResponse.json(buildCustomer({ archived_at: "2026-11-10T09:00:00Z" }))));
    renderInConsole(<CustomerEdit publicId="c-0001" />, MANAGER);

    expect(await screen.findByText("Archived customers can't be edited")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Company name" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to customer" })).toHaveAttribute("href", "/customers/c-0001");
  });

  it("shows a not-found state for a customer outside the company", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json({ code: "not_found", detail: "x", request_id: "r" }, { status: 404 })),
    );
    renderInConsole(<CustomerEdit publicId="c-other" />, MANAGER);

    expect(await screen.findByText("Customer not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to customers" })).toHaveAttribute("href", "/customers");
  });

  it("shows an error with a retry when the customer fails to load", async () => {
    server.use(
      http.get(DETAIL, () =>
        HttpResponse.json({ code: "server_error", detail: "x", request_id: "r" }, { status: 500 }),
      ),
    );
    renderInConsole(<CustomerEdit publicId="c-0001" />, MANAGER);

    expect(await screen.findByText("FleetFlow is unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
