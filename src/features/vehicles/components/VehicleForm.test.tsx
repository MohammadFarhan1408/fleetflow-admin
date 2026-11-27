import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { branchesHandler, buildBranch } from "@/test/branches";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildVehicle } from "@/test/vehicles";
import { VehicleForm } from "./VehicleForm";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const VEHICLES = "*/bff/api/v1/vehicles/";
const VEHICLE = "*/bff/api/v1/vehicles/:id/";
const apiError = (status: number, code: string, errors?: Record<string, string[]>) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", errors }, { status });

const BRANCHES = [buildBranch(), buildBranch({ public_id: "b-2", code: "HAM", name: "Hamburg hub" })];
/** The form with the branches the API will list (`GET /branches/`), not the ones in `/me`. */
const renderForm = (vehicle?: ReturnType<typeof buildVehicle>, branches = BRANCHES) => {
  server.use(branchesHandler(branches));
  return renderInConsole(<VehicleForm vehicle={vehicle} />, { permissions: ["fleet.manage"] });
};

const box = (name: RegExp | string) => screen.getByRole("textbox", { name });
const choose = async (field: RegExp, option: string) => {
  // The Branch field is disabled until the API's list has loaded.
  await waitFor(() => expect(screen.getByRole("combobox", { name: field })).toBeEnabled());
  await userEvent.click(screen.getByRole("combobox", { name: field }));
  await userEvent.click(await screen.findByRole("option", { name: option }));
};
const fillRequired = async () => {
  await userEvent.type(box(/Registration number/), "b ab 1234");
  await choose(/^Branch/, "Berlin depot");
  await choose(/licence category/, "C1");
  await userEvent.type(box(/Weight capacity/), "1500");
  await userEvent.type(box(/Volume capacity/), "12.5");
};
const submit = (label: "Add vehicle" | "Save changes") => screen.getByRole("button", { name: label });

describe("VehicleForm", () => {
  beforeEach(() => navigation.push.mockReset());

  describe("adding a vehicle", () => {
    it("creates it with an idempotency key, confirms, and opens the new vehicle", async () => {
      let request: { body?: unknown; key?: string | null } = {};
      server.use(
        http.post(VEHICLES, async ({ request: incoming }) => {
          request = { body: await incoming.json(), key: incoming.headers.get("idempotency-key") };
          return HttpResponse.json(buildVehicle({ public_id: "v-new" }), { status: 201 });
        }),
      );
      renderForm();

      await fillRequired();
      await userEvent.type(box(/Make/), " Mercedes ");
      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByText("Vehicle B AB 1234 added")).toBeInTheDocument();
      expect(request.body).toEqual({
        registration_number: "b ab 1234",
        branch_id: "b-1",
        required_license_category: "C1",
        capacity_weight_kg: "1500",
        capacity_volume_m3: "12.5",
        make: "Mercedes",
        model: "",
      });
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles/v-new");
    }, 15_000); // types five fields and opens two selects, which is slow in jsdom

    it("marks the required fields and no others, and starts on the registration number", () => {
      renderForm();

      expect(box(/Registration number/)).toBeRequired();
      expect(box(/Registration number/)).toHaveFocus();
      expect(box(/Weight capacity/)).toBeRequired();
      expect(box(/Volume capacity/)).toBeRequired();
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveAttribute("aria-required", "true");
      expect(screen.getByRole("combobox", { name: /licence category/ })).toHaveAttribute("aria-required", "true");
      expect(box(/Make/)).not.toBeRequired();
      expect(box(/Model/)).not.toBeRequired();
    });

    it("asks for every missing required field and sends nothing", async () => {
      const requests = vi.fn();
      server.use(http.post(VEHICLES, () => (requests(), HttpResponse.json(buildVehicle()))));
      renderForm();

      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByText("Enter the registration number")).toBeInTheDocument();
      expect(screen.getByText("Choose a branch", { selector: "p" })).toBeInTheDocument();
      expect(screen.getByText("Choose a licence category", { selector: "p" })).toBeInTheDocument();
      expect(screen.getAllByText(/^Enter the (weight|volume) in /)).toHaveLength(2);
      expect(requests).not.toHaveBeenCalled();
    });

    it.each([
      ["weight", /Weight capacity/, "0", "Enter the weight in kilograms, above 0 and up to 60,000"],
      ["weight", /Weight capacity/, "60001", "Enter the weight in kilograms, above 0 and up to 60,000"],
      ["weight", /Weight capacity/, "12,5", "Enter the weight in kilograms, above 0 and up to 60,000"],
      ["weight", /Weight capacity/, "1.2345", "Enter the weight in kilograms, above 0 and up to 60,000"],
      ["volume", /Volume capacity/, "200.5", "Enter the volume in cubic metres, above 0 and up to 200"],
      ["volume", /Volume capacity/, "-1", "Enter the volume in cubic metres, above 0 and up to 200"],
    ])("refuses a %s of %s (the API's limits)", async (_name, field, value, message) => {
      renderForm();
      await fillRequired();
      await userEvent.clear(box(field));
      await userEvent.type(box(field), value);

      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByText(message)).toBeInTheDocument();
    });

    it("accepts the largest capacities the API allows", async () => {
      let body: { capacity_weight_kg?: string; capacity_volume_m3?: string } = {};
      server.use(
        http.post(VEHICLES, async ({ request }) => {
          body = (await request.json()) as typeof body;
          return HttpResponse.json(buildVehicle(), { status: 201 });
        }),
      );
      renderForm();
      await fillRequired();
      await userEvent.clear(box(/Weight capacity/));
      await userEvent.type(box(/Weight capacity/), "60000");
      await userEvent.clear(box(/Volume capacity/));
      await userEvent.type(box(/Volume capacity/), "200.000");

      await userEvent.click(submit("Add vehicle"));

      await waitFor(() => expect(body).toMatchObject({ capacity_weight_kg: "60000", capacity_volume_m3: "200.000" }));
    });

    it("offers every licence category and the user's branches", async () => {
      renderForm();

      await userEvent.click(screen.getByRole("combobox", { name: /licence category/ }));
      expect(await screen.findAllByRole("option")).toHaveLength(11);
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.getByRole("combobox", { name: /^Branch/ })).toBeEnabled());
      await userEvent.click(screen.getByRole("combobox", { name: /^Branch/ }));
      expect((await screen.findAllByRole("option")).map((option) => option.textContent)).toEqual([
        "Berlin depot",
        "Hamburg hub",
      ]);
    });

    it("says so while the branches load, and offers none until they have", async () => {
      server.use(http.get("*/bff/api/v1/branches/", async () => (await delay("infinite"), HttpResponse.json({}))));
      renderInConsole(<VehicleForm />, { permissions: ["fleet.manage"] });

      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Loading branches…");
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toBeDisabled();
    });

    it("explains an empty branch list instead of offering an empty select", async () => {
      renderForm(undefined, []);

      expect(await screen.findByText(/There is no branch to choose/)).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toBeDisabled();
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("No branches available");
    });

    it("lists a branch the user has no membership in, because the API says it may be chosen", async () => {
      renderForm(undefined, [buildBranch({ public_id: "b-7", code: "MUC", name: "Munich yard" })]);

      await choose(/^Branch/, "Munich yard");
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Munich yard");
    });

    it("offers a retry when the branches cannot be loaded, and works after it", async () => {
      let calls = 0;
      server.use(
        http.get("*/bff/api/v1/branches/", () => {
          calls += 1;
          return calls === 1
            ? apiError(500, "server_error")
            : HttpResponse.json({ results: BRANCHES, next: null, previous: null });
        }),
      );
      renderInConsole(<VehicleForm />, { permissions: ["fleet.manage"] });

      expect(await screen.findByText(/Couldn.t load the branches/)).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toBeDisabled();
      await userEvent.click(screen.getByRole("button", { name: "Try again" }));

      await choose(/^Branch/, "Berlin depot");
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Berlin depot");
    });

    it("starts empty again after saving, because Next keeps this page mounted when it navigates away", async () => {
      server.use(http.post(VEHICLES, () => HttpResponse.json(buildVehicle(), { status: 201 })));
      renderForm();
      await fillRequired();
      await userEvent.click(submit("Add vehicle"));
      await screen.findByText("Vehicle B AB 1234 added");

      expect(box(/Registration number/)).toHaveValue("");
      await waitFor(() =>
        expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Choose a branch"),
      );
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    });

    it("reuses the idempotency key when the same body is retried after a network failure", async () => {
      const keys: (string | null)[] = [];
      let attempts = 0;
      server.use(
        http.post(VEHICLES, ({ request }) => {
          keys.push(request.headers.get("idempotency-key"));
          return ++attempts === 1 ? HttpResponse.error() : HttpResponse.json(buildVehicle(), { status: 201 });
        }),
      );
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add vehicle"));
      expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
      await userEvent.click(submit("Add vehicle"));

      await waitFor(() => expect(keys).toHaveLength(2));
      expect(keys[0]).toBe(keys[1]);
    });
  });

  describe("API failures", () => {
    it("puts a duplicate registration on its field and keeps what was typed", async () => {
      server.use(http.post(VEHICLES, () => apiError(409, "vehicle.duplicate_registration")));
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByText("A vehicle with this registration number already exists")).toBeInTheDocument();
      expect(box(/Registration number/)).toHaveFocus();
      expect(box(/Registration number/)).toHaveValue("b ab 1234");
      expect(navigation.push).not.toHaveBeenCalled();
    });

    it("puts the API's field errors on the fields", async () => {
      server.use(
        http.post(VEHICLES, () =>
          apiError(400, "validation.invalid", { capacity_weight_kg: ["Ensure this value is at most 60000."] }),
        ),
      );
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByText("Ensure this value is at most 60000.")).toBeInTheDocument();
      expect(box(/Weight capacity/)).toHaveAccessibleDescription("Ensure this value is at most 60000.");
    });

    it("shows what it can't place in an alert, without exposing the API's raw message", async () => {
      server.use(http.post(VEHICLES, () => apiError(500, "server_error")));
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByRole("alert")).toHaveTextContent("Reference: req-9");
      expect(screen.queryByText("x")).not.toBeInTheDocument();
    });

    it("leaves the form with an error toast when the permission was lost (403)", async () => {
      server.use(http.post(VEHICLES, () => apiError(403, "permission.denied")));
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add vehicle"));

      expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles");
    });
  });

  describe("editing a vehicle", () => {
    it("starts with the saved values and saves the changes", async () => {
      let request: { id?: string; body?: Record<string, unknown> } = {};
      server.use(
        http.patch(VEHICLE, async ({ params, request: incoming }) => {
          request = { id: String(params.id), body: (await incoming.json()) as Record<string, unknown> };
          return HttpResponse.json(buildVehicle({ model: "Sprinter 316" }));
        }),
      );
      renderForm(buildVehicle());

      expect(box(/Registration number/)).toHaveValue("B AB 1234");
      expect(box(/Weight capacity/)).toHaveValue("1500.000");
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Berlin depot");
      expect(screen.getByRole("combobox", { name: /licence category/ })).toHaveTextContent("C1");
      expect(box(/Registration number/)).not.toHaveFocus();

      await userEvent.clear(box(/Model/));
      await userEvent.type(box(/Model/), "Sprinter 316");
      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("Vehicle B AB 1234 updated")).toBeInTheDocument();
      expect(request.id).toBe("v-0001");
      expect(request.body).toMatchObject({ model: "Sprinter 316", branch_id: "b-1", capacity_weight_kg: "1500.000" });
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles/v-0001");
    });

    it("keeps the vehicle's own branch when the list does not include it, so editing never loses it", async () => {
      renderForm(buildVehicle({ branch: { public_id: "b-9", code: "MUC", name: "Munich yard" } }));

      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Munich yard");
    });

    it("leaves the form when the vehicle was archived meanwhile (409)", async () => {
      server.use(http.patch(VEHICLE, () => apiError(409, "vehicle.archived")));
      renderForm(buildVehicle());
      await userEvent.type(box(/Model/), " 2");

      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("This vehicle was archived")).toBeInTheDocument();
      expect(screen.getByText("Archived vehicles can't be changed.")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles/v-0001");
    });

    it("goes to the list when the vehicle was removed (404)", async () => {
      server.use(http.patch(VEHICLE, () => apiError(404, "not_found")));
      renderForm(buildVehicle());
      await userEvent.type(box(/Model/), " 2");

      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("This no longer exists")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles");
    });
  });

  describe("leaving the form", () => {
    it("asks before discarding changes, and leaves without asking when nothing changed", async () => {
      renderForm();

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles");
      navigation.push.mockReset();

      await userEvent.type(box(/Make/), "Mercedes");
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(await screen.findByRole("dialog", { name: "Discard your changes?" })).toBeInTheDocument();
      expect(navigation.push).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "Discard changes" }));
      expect(navigation.push).toHaveBeenCalledWith("/fleet/vehicles");
    });

    it("warns the browser before a reload while there are unsaved changes", async () => {
      renderForm();
      const beforeUnload = () => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(beforeUnload()).toBe(false);
      await userEvent.type(box(/Make/), "Mercedes");
      expect(beforeUnload()).toBe(true);
    });
  });
});
