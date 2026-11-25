import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildCustomer } from "@/test/customers";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { CustomerActions } from "./CustomerActions";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const ARCHIVE = "*/bff/api/v1/customers/:id/archive/";
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });

const renderActions = (overrides: Parameters<typeof buildCustomer>[0] = {}) =>
  renderInConsole(<CustomerActions customer={buildCustomer(overrides)} />, { permissions: ["customers.manage"] });

describe("CustomerActions", () => {
  beforeEach(() => navigation.push.mockReset());

  it("offers no actions for an archived customer", () => {
    renderActions({ archived_at: "2026-11-10T09:00:00Z" });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("links Edit to the edit page", () => {
    renderActions();

    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/customers/c-0001/edit");
  });

  describe("archive", () => {
    it("names the customer in the confirmation, and sends nothing on Cancel", async () => {
      const requests = vi.fn();
      server.use(http.post(ARCHIVE, () => (requests(), HttpResponse.json(buildCustomer()))));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      expect(await screen.findByRole("dialog", { name: "Archive Northwind Traders?" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(requests).not.toHaveBeenCalled();
    });

    it("archives after confirmation and says so", async () => {
      let key: string | null = null;
      server.use(
        http.post(ARCHIVE, ({ request }) => {
          key = request.headers.get("idempotency-key");
          return HttpResponse.json(buildCustomer({ archived_at: "2026-11-24T10:00:00Z" }));
        }),
      );
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive customer" }));

      expect(await screen.findByText("Customer Northwind Traders archived")).toBeInTheDocument();
      expect(key).toMatch(/^[0-9a-f-]{36}$/);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("does not claim success when the API refuses", async () => {
      server.use(http.post(ARCHIVE, () => apiError(403, "permission.denied")));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive customer" }));

      expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
      expect(screen.queryByText(/archived$/)).not.toBeInTheDocument();
    });

    it("shows an error toast and closes the confirmation after a network failure", async () => {
      server.use(http.post(ARCHIVE, () => HttpResponse.error()));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive customer" }));

      expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
  });
});
