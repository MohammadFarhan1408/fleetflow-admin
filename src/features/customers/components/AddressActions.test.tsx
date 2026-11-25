import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildAddress } from "@/test/customers";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { AddressActions } from "./AddressActions";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const ARCHIVE = "*/bff/api/v1/customers/:customerId/addresses/:id/archive/";
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });

const renderActions = (overrides: Parameters<typeof buildAddress>[0] = {}) =>
  renderInConsole(<AddressActions customerId="c-1" address={buildAddress(overrides)} />, {
    permissions: ["customers.manage"],
  });
const openMenu = () => userEvent.click(screen.getByRole("button", { name: "Actions for Main warehouse" }));

describe("AddressActions", () => {
  beforeEach(() => navigation.push.mockReset());

  it("offers no actions for an archived address", () => {
    renderActions({ archived_at: "2026-11-10T09:00:00Z" });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links Edit to the edit page", async () => {
    renderActions();

    await openMenu();

    expect(await screen.findByRole("menuitem", { name: "Edit" })).toHaveAttribute(
      "href",
      "/customers/c-1/addresses/a-0001/edit",
    );
  });

  it("names the address in the confirmation, and sends nothing on Cancel", async () => {
    const requests = vi.fn();
    server.use(http.post(ARCHIVE, () => (requests(), HttpResponse.json(buildAddress()))));
    renderActions();

    await openMenu();
    await userEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));
    expect(await screen.findByRole("dialog", { name: "Archive Main warehouse?" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(requests).not.toHaveBeenCalled();
  });

  // Regression: the menu item that opened the dialog unmounts with the menu, so focus fell to the page body.
  it("returns focus to the row's menu button when the confirmation is dismissed", async () => {
    renderActions();

    await openMenu();
    await userEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));
    await screen.findByRole("dialog", { name: "Archive Main warehouse?" });
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.getByRole("button", { name: "Actions for Main warehouse" })).toHaveFocus());
  });

  it("falls back to the first line when the address has no label", async () => {
    renderActions({ label: "" });

    await userEvent.click(screen.getByRole("button", { name: "Actions for Hafenstrasse 4" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));

    expect(await screen.findByRole("dialog", { name: "Archive Hafenstrasse 4?" })).toBeInTheDocument();
  });

  it("archives after confirmation, with an idempotency key, and says so", async () => {
    let request: { customerId?: string; id?: string; key?: string | null } = {};
    server.use(
      http.post(ARCHIVE, ({ params, request: incoming }) => {
        request = {
          customerId: String(params.customerId),
          id: String(params.id),
          key: incoming.headers.get("idempotency-key"),
        };
        return HttpResponse.json(buildAddress({ archived_at: "2026-11-24T10:00:00Z" }));
      }),
    );
    renderActions();

    await openMenu();
    await userEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));
    await userEvent.click(await screen.findByRole("button", { name: "Archive address" }));

    expect(await screen.findByText("Address Main warehouse archived")).toBeInTheDocument();
    expect(request).toMatchObject({ customerId: "c-1", id: "a-0001" });
    expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("does not claim success when the API refuses, and explains an archived address", async () => {
    server.use(http.post(ARCHIVE, () => apiError(409, "address.archived")));
    renderActions();

    await openMenu();
    await userEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));
    await userEvent.click(await screen.findByRole("button", { name: "Archive address" }));

    expect(await screen.findByText("This address was archived")).toBeInTheDocument();
    expect(screen.queryByText(/Address Main warehouse archived/)).not.toBeInTheDocument();
  });
});
