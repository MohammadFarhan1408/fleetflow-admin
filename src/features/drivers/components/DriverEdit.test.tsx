import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildDriver } from "@/test/drivers";
import { DriverEdit } from "./DriverEdit";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const DRIVER = "*/bff/api/v1/drivers/:id/";
const MANAGER = { permissions: ["fleet.view", "fleet.manage"], branches: [{ public_id: "b-1", name: "Berlin depot" }] };

describe("DriverEdit", () => {
  it("loads the driver into the form", async () => {
    server.use(http.get(DRIVER, () => HttpResponse.json(buildDriver())));
    renderInConsole(<DriverEdit publicId="d-1" />, MANAGER);

    expect(await screen.findByRole("heading", { level: 1, name: "Edit Dana Driver" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Phone/ })).toHaveValue("+4915112345678");
  });

  it("blocks an archived driver and links back", async () => {
    server.use(http.get(DRIVER, () => HttpResponse.json(buildDriver({ archived_at: "2026-11-10T09:00:00Z" }))));
    renderInConsole(<DriverEdit publicId="d-1" />, MANAGER);

    expect(await screen.findByText("Archived drivers can't be edited")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /Phone/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to driver" })).toHaveAttribute("href", "/fleet/drivers/d-0001");
  });

  it("says not found for an unknown driver", async () => {
    server.use(
      http.get(DRIVER, () => HttpResponse.json({ code: "not_found", detail: "x", request_id: "r" }, { status: 404 })),
    );
    renderInConsole(<DriverEdit publicId="d-1" />, MANAGER);

    expect(await screen.findByText("Driver not found")).toBeInTheDocument();
  });
});
