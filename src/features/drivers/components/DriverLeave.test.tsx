import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { addDays, browserToday } from "@/lib/calendar";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildLeave } from "@/test/drivers";
import { DriverLeave } from "./DriverLeave";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/fleet/drivers/d-1",
  useRouter: () => ({ push: navigation.push, replace: vi.fn() }),
}));

const LEAVE = "*/bff/api/v1/drivers/:id/leave/";
const LEAVE_ONE = "*/bff/api/v1/drivers/:id/leave/:leaveId/";
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });
const list = (results: ReturnType<typeof buildLeave>[]) => HttpResponse.json({ results, next: null, previous: null });
const MANAGER = { permissions: ["fleet.view", "fleet.manage"] };

const renderLeave = (archived = false, session = MANAGER) =>
  renderInConsole(<DriverLeave driverId="d-1" driverName="Dana Driver" archived={archived} />, session);

// Leave dates are relative to today so "not started" holds whenever the suite runs.
const FUTURE = { starts_on: addDays(browserToday(), 10), ends_on: addDays(browserToday(), 12) };
const STARTED = { starts_on: addDays(browserToday(), -2), ends_on: addDays(browserToday(), 2) };

/** Picks a day in the open calendar by its day number in the month shown. */
const pickDay = async (trigger: RegExp, day: string) => {
  await userEvent.click(screen.getByRole("button", { name: trigger }));
  const grid = await screen.findByRole("grid");
  await userEvent.click(within(grid).getByRole("button", { name: new RegExp(`\\b${day}\\b`) }));
};

describe("DriverLeave management", () => {
  beforeEach(() => navigation.push.mockReset());

  it("offers Add leave to managers only, and not for an archived driver", async () => {
    server.use(http.get(LEAVE, () => list([buildLeave(FUTURE)])));
    const { unmount } = renderLeave();
    expect(await screen.findByRole("button", { name: "Add leave" })).toBeInTheDocument();
    unmount();

    renderLeave(false, { permissions: ["fleet.view"] });
    await screen.findByText("Annual leave");
    expect(screen.queryByRole("button", { name: "Add leave" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
  });

  it("offers nothing to change for an archived driver, even to a manager", async () => {
    server.use(http.get(LEAVE, () => list([buildLeave(FUTURE)])));
    renderLeave(true);

    await screen.findByText("Annual leave");
    expect(screen.queryByRole("button", { name: "Add leave" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete leave/ })).not.toBeInTheDocument();
  });

  it("invites the first leave from the empty state", async () => {
    server.use(http.get(LEAVE, () => list([])));
    renderLeave();

    expect(await screen.findByText("No leave recorded")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add leave" })).toBeInTheDocument();
  });

  describe("adding leave", () => {
    it("needs both days and a reason", async () => {
      server.use(http.get(LEAVE, () => list([])));
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: "Add leave" }));
      expect(await screen.findByRole("dialog", { name: "Add leave for Dana Driver" })).toBeInTheDocument();

      await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add leave" }));

      expect(await screen.findByText("Choose the first day")).toBeInTheDocument();
      expect(screen.getByText("Choose the last day")).toBeInTheDocument();
      expect(screen.getByText("Say why the driver is away")).toBeInTheDocument();
    });

    it("sends the days and reason with an idempotency key, counts the days, and confirms", async () => {
      let request: { id?: string; body?: unknown; key?: string | null } = {};
      server.use(
        http.get(LEAVE, () => list([])),
        http.post(LEAVE, async ({ params, request: incoming }) => {
          request = {
            id: String(params.id),
            body: await incoming.json(),
            key: incoming.headers.get("idempotency-key"),
          };
          return HttpResponse.json(buildLeave(), { status: 201 });
        }),
      );
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: "Add leave" }));
      await screen.findByRole("dialog");

      await pickDay(/^First day:/, "10");
      await pickDay(/^Last day:/, "14");
      expect(screen.getByText("5 days")).toBeInTheDocument();
      await userEvent.type(screen.getByRole("textbox", { name: /Reason/ }), " Annual leave ");
      await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add leave" }));

      expect(await screen.findByText("Leave added")).toBeInTheDocument();
      expect(request.id).toBe("d-1");
      expect(request.body).toEqual({
        starts_on: expect.stringMatching(/^\d{4}-\d{2}-10$/),
        ends_on: expect.stringMatching(/^\d{4}-\d{2}-14$/),
        reason: "Annual leave",
      });
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("refuses a last day before the first, and sends nothing", async () => {
      const requests = vi.fn();
      server.use(
        http.get(LEAVE, () => list([])),
        http.post(LEAVE, () => (requests(), HttpResponse.json(buildLeave()))),
      );
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: "Add leave" }));
      await screen.findByRole("dialog");

      await pickDay(/^First day:/, "20");
      await pickDay(/^Last day:/, "10");
      await userEvent.type(screen.getByRole("textbox", { name: /Reason/ }), "Training");
      await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add leave" }));

      expect(await screen.findByText("The last day can't be before the first")).toBeInTheDocument();
      expect(requests).not.toHaveBeenCalled();
    });

    it("says on the dates when the period overlaps recorded leave (409), and keeps the dialog", async () => {
      server.use(
        http.get(LEAVE, () => list([])),
        http.post(LEAVE, () => apiError(409, "driver.leave_overlap")),
      );
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: "Add leave" }));
      await screen.findByRole("dialog");
      await pickDay(/^First day:/, "10");
      await pickDay(/^Last day:/, "14");
      await userEvent.type(screen.getByRole("textbox", { name: /Reason/ }), "Training");

      await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add leave" }));

      expect(await screen.findByText("This overlaps leave already recorded")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes with an error toast when the driver was archived meanwhile (409)", async () => {
      server.use(
        http.get(LEAVE, () => list([])),
        http.post(LEAVE, () => apiError(409, "driver.archived")),
      );
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: "Add leave" }));
      await screen.findByRole("dialog");
      await pickDay(/^First day:/, "10");
      await pickDay(/^Last day:/, "14");
      await userEvent.type(screen.getByRole("textbox", { name: /Reason/ }), "Training");

      await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add leave" }));

      expect(await screen.findByText("This driver was archived")).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
  });

  describe("deleting leave", () => {
    it("shows Delete only for leave that has not started", async () => {
      server.use(
        http.get(LEAVE, () =>
          list([
            buildLeave({ ...FUTURE, public_id: "l-future", reason: "Holiday" }),
            buildLeave({ ...STARTED, public_id: "l-started", reason: "Sick" }),
          ]),
        ),
      );
      renderLeave();

      await screen.findByText("Holiday");
      expect(screen.getAllByRole("button", { name: /^Delete leave from/ })).toHaveLength(1);
      const startedRow = screen.getByText("Sick").closest("tr")!;
      expect(within(startedRow).queryByRole("button")).not.toBeInTheDocument();
    });

    it("names the period in the confirmation, sends nothing on Cancel, and deletes after confirming", async () => {
      const deletes = vi.fn();
      server.use(
        http.get(LEAVE, () => list([buildLeave({ ...FUTURE, public_id: "l-future" })])),
        http.delete(LEAVE_ONE, ({ params, request }) => {
          deletes({ id: params.id, leaveId: params.leaveId, key: request.headers.get("idempotency-key") });
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: /^Delete leave from/ }));
      expect(await screen.findByRole("dialog", { name: /^Delete leave from .* to .*\?$/ })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(deletes).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: /^Delete leave from/ }));
      await userEvent.click(await screen.findByRole("button", { name: "Delete leave" }));

      expect(await screen.findByText("Leave deleted")).toBeInTheDocument();
      expect(deletes).toHaveBeenCalledWith({
        id: "d-1",
        leaveId: "l-future",
        key: expect.stringMatching(/^[0-9a-f-]{36}$/),
      });
    });

    it("does not claim success when the leave has started meanwhile (409)", async () => {
      server.use(
        http.get(LEAVE, () => list([buildLeave({ ...FUTURE, public_id: "l-future" })])),
        http.delete(LEAVE_ONE, () => apiError(409, "driver.leave_started")),
      );
      renderLeave();
      await userEvent.click(await screen.findByRole("button", { name: /^Delete leave from/ }));
      await userEvent.click(await screen.findByRole("button", { name: "Delete leave" }));

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.queryByText("Leave deleted")).not.toBeInTheDocument();
    });
  });
});
