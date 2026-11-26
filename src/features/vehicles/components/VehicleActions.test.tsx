import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildVehicle } from "@/test/vehicles";
import { VehicleActions } from "./VehicleActions";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const ARCHIVE = "*/bff/api/v1/vehicles/:id/archive/";
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });

const renderActions = (overrides: Parameters<typeof buildVehicle>[0] = {}) =>
  renderInConsole(<VehicleActions vehicle={buildVehicle(overrides)} />, { permissions: ["fleet.manage"] });

describe("VehicleActions", () => {
  beforeEach(() => navigation.push.mockReset());

  it("offers no actions for an archived vehicle", () => {
    renderActions({ archived_at: "2026-11-10T09:00:00Z" });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("links Edit to the edit page", () => {
    renderActions();

    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/fleet/vehicles/v-0001/edit");
  });

  it("opens the status dialog, and returns focus to its button when it is dismissed", async () => {
    renderActions();

    await userEvent.click(screen.getByRole("button", { name: "Change status" }));
    expect(await screen.findByRole("dialog", { name: "Change status of B AB 1234" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    // Radix restores focus a tick after the dialog unmounts.
    await waitFor(() => expect(screen.getByRole("button", { name: "Change status" })).toHaveFocus());
  });

  describe("archive", () => {
    it("names the vehicle in the confirmation, and sends nothing on Cancel", async () => {
      const requests = vi.fn();
      server.use(http.post(ARCHIVE, () => (requests(), HttpResponse.json(buildVehicle()))));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      expect(await screen.findByRole("dialog", { name: "Archive B AB 1234?" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(requests).not.toHaveBeenCalled();
    });

    it("archives after confirmation, with an idempotency key, and says so", async () => {
      let request: { id?: string; key?: string | null } = {};
      server.use(
        http.post(ARCHIVE, ({ params, request: incoming }) => {
          request = { id: String(params.id), key: incoming.headers.get("idempotency-key") };
          return HttpResponse.json(buildVehicle({ archived_at: "2026-11-26T10:00:00Z" }));
        }),
      );
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive vehicle" }));

      expect(await screen.findByText("Vehicle B AB 1234 archived")).toBeInTheDocument();
      expect(request.id).toBe("v-0001");
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("does not claim success when the API refuses", async () => {
      server.use(http.post(ARCHIVE, () => apiError(403, "permission.denied")));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive vehicle" }));

      expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
      expect(screen.queryByText(/archived$/)).not.toBeInTheDocument();
    });

    it("shows an error toast and closes the confirmation after a network failure", async () => {
      server.use(http.post(ARCHIVE, () => HttpResponse.error()));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive vehicle" }));

      expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
  });
});
