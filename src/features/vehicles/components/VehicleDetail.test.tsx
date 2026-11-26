import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildVehicle } from "@/test/vehicles";
import { VehicleDetail } from "./VehicleDetail";

const VEHICLE = "*/bff/api/v1/vehicles/:id/";
const VIEW = { permissions: ["fleet.view"] };
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });

describe("VehicleDetail", () => {
  it("shows the vehicle, its status, capacity and record", async () => {
    server.use(
      http.get(VEHICLE, ({ params }) => {
        expect(params.id).toBe("v-1");
        return HttpResponse.json(buildVehicle());
      }),
    );
    renderInConsole(<VehicleDetail publicId="v-1" />, VIEW);

    expect(await screen.findByRole("heading", { level: 1, name: "B AB 1234" })).toBeInTheDocument();
    expect(screen.getByText("Berlin depot")).toBeInTheDocument();
    expect(screen.getByText("BER")).toBeInTheDocument();
    expect(screen.getByText("C1")).toBeInTheDocument();
    expect(screen.getByText("1,500 kg")).toBeInTheDocument();
    expect(screen.getByText("12.5 m³")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.queryByText("Reason")).not.toBeInTheDocument();
    expect(screen.queryByText("Archived")).not.toBeInTheDocument();
  });

  it("explains an unavailable vehicle: the status, the reason given, and what blocks it today", async () => {
    server.use(
      http.get(VEHICLE, () =>
        HttpResponse.json(
          buildVehicle({
            status: "out_of_service",
            status_reason: "Gearbox failure",
            availability: { date: "2026-11-26", available: false, reasons: ["out_of_service"] },
          }),
        ),
      ),
    );
    renderInConsole(<VehicleDetail publicId="v-1" />, VIEW);

    const status = (await screen.findByText("Gearbox failure")).closest("div")!;
    expect(status).toHaveTextContent("Reason");
    expect(screen.getAllByText("Out of service").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Unavailable: Out of service")).toBeInTheDocument();
  });

  it("shows an archived vehicle as archived, with the date", async () => {
    server.use(
      http.get(VEHICLE, () =>
        HttpResponse.json(
          buildVehicle({
            archived_at: "2026-11-10T09:00:00Z",
            availability: { date: "2026-11-26", available: false, reasons: ["archived"] },
          }),
        ),
      ),
    );
    renderInConsole(<VehicleDetail publicId="v-1" />, VIEW);

    await screen.findByRole("heading", { level: 1 });
    expect(screen.getAllByText("Archived").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("does not invent a make and model that are empty", async () => {
    server.use(http.get(VEHICLE, () => HttpResponse.json(buildVehicle({ make: "", model: "" }))));
    renderInConsole(<VehicleDetail publicId="v-1" />, VIEW);

    const make = (await screen.findByText("Make")).closest("div")!;
    expect(within(make).getByText("—")).toBeInTheDocument();
  });

  it("says when the vehicle does not exist or belongs to a branch the user cannot see (API 404)", async () => {
    server.use(http.get(VEHICLE, () => apiError(404, "not_found")));
    renderInConsole(<VehicleDetail publicId="v-other" />, VIEW);

    expect(await screen.findByText("Vehicle not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to vehicles" })).toHaveAttribute("href", "/fleet/vehicles");
  });

  it("shows a retryable error with the request ID, and recovers", async () => {
    let calls = 0;
    server.use(
      http.get(VEHICLE, () => {
        calls += 1;
        return calls === 1 ? apiError(500, "server_error") : HttpResponse.json(buildVehicle());
      }),
    );
    renderInConsole(<VehicleDetail publicId="v-1" />, VIEW);

    expect(await screen.findByText("Reference: req-9")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { level: 1, name: "B AB 1234" })).toBeInTheDocument();
  });
});
