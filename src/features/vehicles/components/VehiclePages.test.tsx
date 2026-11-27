import { act, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { branchesHandler } from "@/test/branches";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildVehicle } from "@/test/vehicles";
import { VehicleDetail } from "./VehicleDetail";
import { VehicleEdit } from "./VehicleEdit";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const VEHICLE = "*/bff/api/v1/vehicles/:id/";
const MANAGER = { permissions: ["fleet.view", "fleet.manage"] };

describe("VehicleEdit", () => {
  beforeEach(() => server.use(branchesHandler()));

  it("loads the vehicle into the form", async () => {
    server.use(http.get(VEHICLE, () => HttpResponse.json(buildVehicle())));
    renderInConsole(<VehicleEdit publicId="v-1" />, MANAGER);

    expect(await screen.findByRole("heading", { level: 1, name: "Edit B AB 1234" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Registration number/ })).toHaveValue("B AB 1234");
  });

  it("shows the saved values again after the vehicle is refetched, not what was there before", async () => {
    let model = "Sprinter";
    server.use(
      http.get(VEHICLE, () =>
        HttpResponse.json(buildVehicle({ model, updated_at: model === "Sprinter" ? "t1" : "t2" })),
      ),
    );
    const { client } = renderInConsole(<VehicleEdit publicId="v-1" />, MANAGER);
    expect(await screen.findByRole("textbox", { name: /Model/ })).toHaveValue("Sprinter");

    model = "Sprinter 316";
    await act(() => client.invalidateQueries({ queryKey: ["vehicles"] }));

    expect(await screen.findByDisplayValue("Sprinter 316")).toBeInTheDocument();
  });

  it("blocks an archived vehicle and links back", async () => {
    server.use(http.get(VEHICLE, () => HttpResponse.json(buildVehicle({ archived_at: "2026-11-10T09:00:00Z" }))));
    renderInConsole(<VehicleEdit publicId="v-1" />, MANAGER);

    expect(await screen.findByText("Archived vehicles can't be edited")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to vehicle" })).toHaveAttribute("href", "/fleet/vehicles/v-0001");
  });

  it("says when the vehicle does not exist", async () => {
    server.use(http.get(VEHICLE, () => HttpResponse.json({ code: "not_found", detail: "x" }, { status: 404 })));
    renderInConsole(<VehicleEdit publicId="v-1" />, MANAGER);

    expect(await screen.findByText("Vehicle not found")).toBeInTheDocument();
  });
});

describe("VehicleDetail actions", () => {
  const withVehicle = (overrides: Parameters<typeof buildVehicle>[0] = {}) =>
    server.use(http.get(VEHICLE, () => HttpResponse.json(buildVehicle(overrides))));

  it("links Edit to the edit page for users who may manage the fleet", async () => {
    withVehicle();
    renderInConsole(<VehicleDetail publicId="v-1" />, MANAGER);

    expect(await screen.findByRole("link", { name: "Edit" })).toHaveAttribute("href", "/fleet/vehicles/v-0001/edit");
  });

  it("offers Change status and Archive to managers too", async () => {
    withVehicle();
    renderInConsole(<VehicleDetail publicId="v-1" />, MANAGER);

    expect(await screen.findByRole("button", { name: "Change status" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
  });

  it("shows view-only users no way to change the vehicle", async () => {
    withVehicle();
    renderInConsole(<VehicleDetail publicId="v-1" />, { permissions: ["fleet.view"] });

    await screen.findByRole("heading", { level: 1, name: "B AB 1234" });
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change status" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Archive" })).not.toBeInTheDocument();
  });

  it("offers no actions for an archived vehicle, even to a manager", async () => {
    withVehicle({ archived_at: "2026-11-10T09:00:00Z" });
    renderInConsole(<VehicleDetail publicId="v-1" />, MANAGER);

    await screen.findByRole("heading", { level: 1, name: "B AB 1234" });
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });
});
