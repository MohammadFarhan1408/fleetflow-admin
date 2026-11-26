import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildVehicle } from "@/test/vehicles";
import { VehicleStatusDialog } from "./VehicleStatusDialog";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const STATUS = "*/bff/api/v1/vehicles/:id/status/";
const apiError = (status: number, code: string, errors?: Record<string, string[]>) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", errors }, { status });

const renderDialog = (overrides: Parameters<typeof buildVehicle>[0] = {}) => {
  const onOpenChange = vi.fn();
  renderInConsole(<VehicleStatusDialog vehicle={buildVehicle(overrides)} open onOpenChange={onOpenChange} />, {
    permissions: ["fleet.manage"],
  });
  return { onOpenChange };
};
const reasonBox = () => screen.getByRole("textbox", { name: /Reason/ });
const choose = (label: string) => userEvent.click(screen.getByRole("radio", { name: new RegExp(label) }));
const save = () => userEvent.click(screen.getByRole("button", { name: "Save status" }));

describe("VehicleStatusDialog", () => {
  beforeEach(() => navigation.push.mockReset());

  it("names the vehicle, and starts on its current status with nothing to save", () => {
    renderDialog({ status: "in_maintenance", status_reason: "Brake service" });

    expect(screen.getByRole("dialog", { name: "Change status of B AB 1234" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /In maintenance/ })).toBeChecked();
    expect(reasonBox()).toHaveValue("Brake service");
    expect(screen.getByRole("button", { name: "Save status" })).toBeDisabled();
  });

  it("explains each status for dispatch", () => {
    renderDialog();

    expect(screen.getByRole("radio", { name: /Active/ })).toHaveAccessibleDescription(
      "In service and can be assigned to routes.",
    );
    expect(screen.getByRole("radiogroup", { name: /Status/ })).toBeRequired();
  });

  it("asks for a reason in maintenance and out of service only, and counts the characters", async () => {
    renderDialog();
    expect(screen.queryByRole("textbox", { name: /Reason/ })).not.toBeInTheDocument();

    await choose("In maintenance");
    expect(reasonBox()).toBeRequired();
    expect(screen.getByText("0/255")).toBeInTheDocument();
    await userEvent.type(reasonBox(), "Brakes");
    expect(screen.getByText("6/255")).toBeInTheDocument();

    await choose("Active");
    expect(screen.queryByRole("textbox", { name: /Reason/ })).not.toBeInTheDocument();
  });

  it("changes the status with the reason and an idempotency key, then confirms and closes", async () => {
    let request: { id?: string; body?: unknown; key?: string | null } = {};
    server.use(
      http.post(STATUS, async ({ params, request: incoming }) => {
        request = {
          id: String(params.id),
          body: await incoming.json(),
          key: incoming.headers.get("idempotency-key"),
        };
        return HttpResponse.json(buildVehicle({ status: "in_maintenance", status_reason: "Brake service" }));
      }),
    );
    const { onOpenChange } = renderDialog();

    await choose("In maintenance");
    await userEvent.type(reasonBox(), "  Brake service ");
    await save();

    expect(await screen.findByText("B AB 1234 is now in maintenance")).toBeInTheDocument();
    expect(request.id).toBe("v-0001");
    expect(request.body).toEqual({ status: "in_maintenance", reason: "Brake service" });
    expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("clears the reason when the vehicle goes back to active", async () => {
    let body: unknown;
    server.use(
      http.post(STATUS, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(buildVehicle());
      }),
    );
    renderDialog({ status: "out_of_service", status_reason: "Gearbox failure" });

    await choose("Active");
    await save();

    expect(await screen.findByText("B AB 1234 is now active")).toBeInTheDocument();
    expect(body).toEqual({ status: "active", reason: "" });
  });

  it("says when only the reason changed", async () => {
    server.use(
      http.post(STATUS, () =>
        HttpResponse.json(buildVehicle({ status: "in_maintenance", status_reason: "New reason" })),
      ),
    );
    renderDialog({ status: "in_maintenance", status_reason: "Brake service" });

    await userEvent.clear(reasonBox());
    await userEvent.type(reasonBox(), "New reason");
    await save();

    expect(await screen.findByText("Reason for B AB 1234 updated")).toBeInTheDocument();
  });

  it.each([
    ["in_maintenance", "In maintenance", "Say why the vehicle is in maintenance"],
    ["out_of_service", "Out of service", "Say why the vehicle is out of service"],
  ])("refuses %s without a reason, and sends nothing", async (_status, label, message) => {
    const requests = vi.fn();
    server.use(http.post(STATUS, () => (requests(), HttpResponse.json(buildVehicle()))));
    renderDialog();

    await choose(label);
    await save();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(reasonBox()).toHaveAccessibleDescription(message);
    expect(requests).not.toHaveBeenCalled();
  });

  it("refuses a reason over the API's 255 characters", async () => {
    renderDialog();
    await choose("Out of service");
    await userEvent.click(reasonBox());
    await userEvent.paste("x".repeat(256));
    await save();

    expect(await screen.findByText("Reason must be 255 characters or fewer")).toBeInTheDocument();
  });

  it("puts the API's field errors on the fields", async () => {
    server.use(http.post(STATUS, () => apiError(400, "validation.invalid", { reason: ["This field is required."] })));
    renderDialog();
    await choose("In maintenance");
    await userEvent.type(reasonBox(), "Brakes");

    await save();

    expect(await screen.findByText("This field is required.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes with an error toast when the vehicle was archived meanwhile (409)", async () => {
    server.use(http.post(STATUS, () => apiError(409, "vehicle.archived")));
    const { onOpenChange } = renderDialog();
    await choose("Out of service");
    await userEvent.type(reasonBox(), "Gearbox");

    await save();

    expect(await screen.findByText("This vehicle was archived")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not claim success when the API refuses (403)", async () => {
    server.use(http.post(STATUS, () => apiError(403, "permission.denied")));
    const { onOpenChange } = renderDialog();
    await choose("Out of service");
    await userEvent.type(reasonBox(), "Gearbox");

    await save();

    expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
    expect(screen.queryByText(/is now/)).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the dialog and what was typed after a network failure, and retries with the same key", async () => {
    const keys: (string | null)[] = [];
    let attempts = 0;
    server.use(
      http.post(STATUS, ({ request }) => {
        keys.push(request.headers.get("idempotency-key"));
        return ++attempts === 1 ? HttpResponse.error() : HttpResponse.json(buildVehicle({ status: "out_of_service" }));
      }),
    );
    renderDialog();
    await choose("Out of service");
    await userEvent.type(reasonBox(), "Gearbox");

    await save();
    expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
    expect(reasonBox()).toHaveValue("Gearbox");
    await save();

    await waitFor(() => expect(keys).toHaveLength(2));
    expect(keys[0]).toBe(keys[1]);
  });

  it("closes without saving on Cancel", async () => {
    const requests = vi.fn();
    server.use(http.post(STATUS, () => (requests(), HttpResponse.json(buildVehicle()))));
    const { onOpenChange } = renderDialog();

    await choose("Out of service");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(requests).not.toHaveBeenCalled();
  });
});
