import { act, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { buildAddress, buildCustomer } from "@/test/customers";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { AddressEdit } from "./AddressEdit";
import { AddressNew } from "./AddressNew";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const CUSTOMER = "*/bff/api/v1/customers/:id/";
const ADDRESS = "*/bff/api/v1/customers/:customerId/addresses/:id/";
const MANAGER = { permissions: ["customers.manage"] };

describe("AddressNew", () => {
  it("shows the form for an active customer, named in the heading", async () => {
    server.use(http.get(CUSTOMER, () => HttpResponse.json(buildCustomer())));
    renderInConsole(<AddressNew customerId="c-0001" />, MANAGER);

    expect(await screen.findByRole("heading", { level: 1, name: "Add address" })).toBeInTheDocument();
    expect(screen.getByText("A pickup or delivery address for Northwind Traders.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Address line 1/ })).toHaveFocus();
  });

  it("takes no new address for an archived customer, and links back", async () => {
    server.use(http.get(CUSTOMER, () => HttpResponse.json(buildCustomer({ archived_at: "2026-11-10T09:00:00Z" }))));
    renderInConsole(<AddressNew customerId="c-0001" />, MANAGER);

    expect(await screen.findByText("Archived customers can't take new addresses")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to customer" })).toHaveAttribute("href", "/customers/c-0001");
  });

  it("says when the customer does not exist", async () => {
    server.use(http.get(CUSTOMER, () => HttpResponse.json({ code: "not_found", detail: "x" }, { status: 404 })));
    renderInConsole(<AddressNew customerId="c-0001" />, MANAGER);

    expect(await screen.findByText("Customer not found")).toBeInTheDocument();
  });
});

describe("AddressEdit", () => {
  it("loads the address into the form", async () => {
    server.use(http.get(ADDRESS, () => HttpResponse.json(buildAddress())));
    renderInConsole(<AddressEdit customerId="c-1" addressId="a-0001" />, MANAGER);

    expect(await screen.findByRole("heading", { level: 1, name: "Edit Main warehouse" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Address line 1/ })).toHaveValue("Hafenstrasse 4");
  });

  it("shows the saved values again after the address is refetched, not what was there before", async () => {
    let label = "Main warehouse";
    server.use(
      http.get(ADDRESS, () =>
        HttpResponse.json(buildAddress({ label, updated_at: label === "Main warehouse" ? "t1" : "t2" })),
      ),
    );
    const { client } = renderInConsole(<AddressEdit customerId="c-1" addressId="a-0001" />, MANAGER);
    expect(await screen.findByRole("textbox", { name: /Label/ })).toHaveValue("Main warehouse");

    label = "Main depot";
    await act(() => client.invalidateQueries({ queryKey: ["customers", "addresses", "c-1"] }));

    expect(await screen.findByDisplayValue("Main depot")).toBeInTheDocument();
  });

  it("blocks an archived address", async () => {
    server.use(http.get(ADDRESS, () => HttpResponse.json(buildAddress({ archived_at: "2026-11-10T09:00:00Z" }))));
    renderInConsole(<AddressEdit customerId="c-1" addressId="a-0001" />, MANAGER);

    expect(await screen.findByText("Archived addresses can't be edited")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("says when the address does not exist", async () => {
    server.use(http.get(ADDRESS, () => HttpResponse.json({ code: "not_found", detail: "x" }, { status: 404 })));
    renderInConsole(<AddressEdit customerId="c-1" addressId="a-0001" />, MANAGER);

    expect(await screen.findByText("Address not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to customer" })).toHaveAttribute("href", "/customers/c-1");
  });
});
