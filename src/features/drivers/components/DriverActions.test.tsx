import { useQuery } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildDriver } from "@/test/drivers";
import { driversQueries } from "../api";
import { DriverActions } from "./DriverActions";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const ARCHIVE = "*/bff/api/v1/drivers/:id/archive/";
const UNARCHIVE = "*/bff/api/v1/drivers/:id/unarchive/";
const STATUS = "*/bff/api/v1/drivers/:id/status/";
const apiError = (status: number, code: string, errors?: Record<string, string[]>) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", errors }, { status });

const renderActions = (overrides: Parameters<typeof buildDriver>[0] = {}) =>
  renderInConsole(<DriverActions driver={buildDriver(overrides)} />, { permissions: ["fleet.manage"] });

describe("DriverActions", () => {
  beforeEach(() => navigation.push.mockReset());

  describe("an archived driver", () => {
    const ARCHIVED = { archived_at: "2026-11-10T09:00:00Z" };

    it("offers only Unarchive: nothing else can change an archived driver", () => {
      renderActions(ARCHIVED);

      expect(screen.getByRole("button", { name: "Unarchive" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Archive" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Change status" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
    });

    it("unarchives with an idempotency key and says so", async () => {
      let request: { id?: string; key?: string | null } = {};
      server.use(
        http.post(UNARCHIVE, ({ params, request: incoming }) => {
          request = { id: String(params.id), key: incoming.headers.get("idempotency-key") };
          return HttpResponse.json(buildDriver());
        }),
      );
      renderActions(ARCHIVED);

      await userEvent.click(screen.getByRole("button", { name: "Unarchive" }));

      expect(await screen.findByText("Driver Dana Driver unarchived")).toBeInTheDocument();
      expect(request.id).toBe("d-0001");
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("refetches the driver, so the full set of actions comes back", async () => {
      let archived = true;
      server.use(
        http.get("*/bff/api/v1/drivers/:id/", () => HttpResponse.json(buildDriver(archived ? ARCHIVED : {}))),
        http.post(UNARCHIVE, () => {
          archived = false;
          return HttpResponse.json(buildDriver());
        }),
      );
      const Probe = () => {
        const { data } = useQuery(driversQueries.detail("d-0001", null));
        return data ? <DriverActions driver={data} /> : null;
      };
      renderInConsole(<Probe />, { permissions: ["fleet.manage"] });

      await userEvent.click(await screen.findByRole("button", { name: "Unarchive" }));

      expect(await screen.findByRole("button", { name: "Archive" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
    });

    it("does not claim success when the API refuses", async () => {
      server.use(http.post(UNARCHIVE, () => apiError(403, "permission.denied")));
      renderActions(ARCHIVED);

      await userEvent.click(screen.getByRole("button", { name: "Unarchive" }));

      expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
      expect(screen.queryByText(/unarchived$/)).not.toBeInTheDocument();
    });

    it("goes back to the list when the driver no longer exists (404)", async () => {
      server.use(http.post(UNARCHIVE, () => apiError(404, "not_found")));
      renderActions(ARCHIVED);

      await userEvent.click(screen.getByRole("button", { name: "Unarchive" }));

      await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/fleet/drivers"));
    });
  });

  it("links Edit to the edit page", () => {
    renderActions();

    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/fleet/drivers/d-0001/edit");
  });

  describe("status", () => {
    it("opens on the current status with nothing to save, and returns focus when dismissed", async () => {
      renderActions({ status: "suspended", status_reason: "Missed medical" });

      await userEvent.click(screen.getByRole("button", { name: "Change status" }));
      expect(await screen.findByRole("dialog", { name: "Change status of Dana Driver" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /Suspended/ })).toBeChecked();
      expect(screen.getByRole("textbox", { name: /Reason/ })).toHaveValue("Missed medical");
      expect(screen.getByRole("button", { name: "Save status" })).toBeDisabled();
      await userEvent.keyboard("{Escape}");

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await waitFor(() => expect(screen.getByRole("button", { name: "Change status" })).toHaveFocus());
    });

    it("suspends with a reason, and refuses a suspension without one", async () => {
      let body: unknown;
      const requests = vi.fn();
      server.use(
        http.post(STATUS, async ({ request }) => {
          requests();
          body = await request.json();
          return HttpResponse.json(buildDriver({ status: "suspended", status_reason: "Missed medical" }));
        }),
      );
      renderActions();
      await userEvent.click(screen.getByRole("button", { name: "Change status" }));
      await userEvent.click(await screen.findByRole("radio", { name: /Suspended/ }));

      await userEvent.click(screen.getByRole("button", { name: "Save status" }));
      expect(await screen.findByText("Say why the driver is suspended")).toBeInTheDocument();
      expect(requests).not.toHaveBeenCalled();

      await userEvent.type(screen.getByRole("textbox", { name: /Reason/ }), " Missed medical ");
      await userEvent.click(screen.getByRole("button", { name: "Save status" }));

      expect(await screen.findByText("Dana Driver is now suspended")).toBeInTheDocument();
      expect(body).toEqual({ status: "suspended", reason: "Missed medical" });
    });

    it("reinstates a suspended driver and clears the reason", async () => {
      let body: unknown;
      server.use(
        http.post(STATUS, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildDriver());
        }),
      );
      renderActions({ status: "suspended", status_reason: "Missed medical" });
      await userEvent.click(screen.getByRole("button", { name: "Change status" }));
      await userEvent.click(await screen.findByRole("radio", { name: /Active/ }));

      await userEvent.click(screen.getByRole("button", { name: "Save status" }));

      expect(await screen.findByText("Dana Driver is now active")).toBeInTheDocument();
      expect(body).toEqual({ status: "active", reason: "" });
    });

    it("closes with an error toast when the driver was archived meanwhile (409)", async () => {
      server.use(http.post(STATUS, () => apiError(409, "driver.archived")));
      renderActions({ status: "suspended", status_reason: "x" });
      await userEvent.click(screen.getByRole("button", { name: "Change status" }));
      await userEvent.click(await screen.findByRole("radio", { name: /Active/ }));

      await userEvent.click(screen.getByRole("button", { name: "Save status" }));

      expect(await screen.findByText("This driver was archived")).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
  });

  describe("archive", () => {
    it("names the driver in the confirmation, and sends nothing on Cancel", async () => {
      const requests = vi.fn();
      server.use(http.post(ARCHIVE, () => (requests(), HttpResponse.json(buildDriver()))));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      expect(await screen.findByRole("dialog", { name: "Archive Dana Driver?" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(requests).not.toHaveBeenCalled();
    });

    it("archives after confirmation, with an idempotency key, and says so", async () => {
      let request: { id?: string; key?: string | null } = {};
      server.use(
        http.post(ARCHIVE, ({ params, request: incoming }) => {
          request = { id: String(params.id), key: incoming.headers.get("idempotency-key") };
          return HttpResponse.json(buildDriver({ archived_at: "2026-11-26T10:00:00Z" }));
        }),
      );
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive driver" }));

      expect(await screen.findByText("Driver Dana Driver archived")).toBeInTheDocument();
      expect(request.id).toBe("d-0001");
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("does not claim success when the API refuses", async () => {
      server.use(http.post(ARCHIVE, () => apiError(403, "permission.denied")));
      renderActions();

      await userEvent.click(screen.getByRole("button", { name: "Archive" }));
      await userEvent.click(await screen.findByRole("button", { name: "Archive driver" }));

      expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
      expect(screen.queryByText(/archived$/)).not.toBeInTheDocument();
    });
  });
});
