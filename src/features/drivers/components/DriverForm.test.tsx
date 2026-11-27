import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { buildDriver } from "@/test/drivers";
import { buildUser } from "@/test/users";
import { DriverForm } from "./DriverForm";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const USERS = "*/bff/api/v1/users/";
const DRIVERS = "*/bff/api/v1/drivers/";
const DRIVER = "*/bff/api/v1/drivers/:id/";
const apiError = (status: number, code: string, errors?: Record<string, string[]>) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", errors }, { status });
const page = (results: unknown[]) => HttpResponse.json({ results, next: null, previous: null });

const BRANCHES = [
  { public_id: "b-1", name: "Berlin depot" },
  { public_id: "b-2", name: "Hamburg hub" },
];
const MANAGER = { permissions: ["fleet.manage", "users.view"], branches: BRANCHES };

/** One user with the driver role waiting for a profile, one already profiled, one without the role. */
const seedUsers = () =>
  server.use(
    http.get(USERS, () =>
      page([
        buildUser({ public_id: "u-free", full_name: "Dana Driver", email: "dana@x.test", roles: ["driver"] }),
        buildUser({ public_id: "u-profiled", full_name: "Pat Profiled", email: "pat@x.test", roles: ["driver"] }),
        buildUser({ public_id: "u-disp", full_name: "Dee Dispatcher", email: "dee@x.test", roles: ["dispatcher"] }),
      ]),
    ),
    http.get(DRIVERS, () =>
      page([buildDriver({ user: { public_id: "u-profiled", full_name: "Pat Profiled", email: "pat@x.test" } })]),
    ),
  );

const choose = async (field: RegExp, option: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: field }));
  await userEvent.click(await screen.findByRole("option", { name: option }));
};
const phone = () => screen.getByRole("textbox", { name: /Phone/ });

describe("DriverForm", () => {
  beforeEach(() => navigation.push.mockReset());

  describe("adding a driver", () => {
    it("lists only users who can still get a profile, and creates it with a normalized phone and a key", async () => {
      seedUsers();
      let request: { body?: unknown; key?: string | null } = {};
      server.use(
        http.post(DRIVERS, async ({ request: incoming }) => {
          request = { body: await incoming.json(), key: incoming.headers.get("idempotency-key") };
          return HttpResponse.json(buildDriver({ public_id: "d-new" }), { status: 201 });
        }),
      );
      renderInConsole(<DriverForm />, MANAGER);

      await userEvent.click(await screen.findByRole("combobox", { name: /^User/ }));
      expect(await screen.findByRole("option", { name: "Dana Driver · dana@x.test" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /Pat Profiled/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /Dee Dispatcher/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("option", { name: "Dana Driver · dana@x.test" }));
      await choose(/^Branch/, "Berlin depot");
      await userEvent.type(phone(), "+49 (151) 1234-5678");
      await userEvent.click(screen.getByRole("button", { name: "Add driver" }));

      expect(await screen.findByText("Driver Dana Driver added")).toBeInTheDocument();
      expect(request.body).toEqual({ user_id: "u-free", branch_id: "b-1", phone: "+4915112345678" });
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
      expect(navigation.push).toHaveBeenCalledWith("/fleet/drivers/d-new");
    });

    it("shows every required error on one click, and sends nothing", async () => {
      seedUsers();
      const requests = vi.fn();
      server.use(http.post(DRIVERS, () => (requests(), HttpResponse.json(buildDriver()))));
      renderInConsole(<DriverForm />, MANAGER);
      await screen.findByRole("combobox", { name: /^User/ });

      await userEvent.click(screen.getByRole("button", { name: "Add driver" }));

      expect(await screen.findByText("Choose the user who will drive")).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveAccessibleDescription("Choose a branch");
      expect(screen.getByText("Enter a phone number")).toBeInTheDocument();
      expect(requests).not.toHaveBeenCalled();
    });

    it("refuses a phone without the country code", async () => {
      seedUsers();
      renderInConsole(<DriverForm />, MANAGER);
      await screen.findByRole("combobox", { name: /^User/ });

      await userEvent.type(phone(), "0151 1234567");
      await userEvent.click(screen.getByRole("button", { name: "Add driver" }));

      expect(await screen.findByText("Include the country code, like +1 415 555 0123")).toBeInTheDocument();
    });

    it("puts a second profile for the same user on the user field and refreshes the list", async () => {
      seedUsers();
      server.use(http.post(DRIVERS, () => apiError(409, "driver.already_exists")));
      renderInConsole(<DriverForm />, MANAGER);
      await userEvent.click(await screen.findByRole("combobox", { name: /^User/ }));
      await userEvent.click(await screen.findByRole("option", { name: /Dana Driver/ }));
      await choose(/^Branch/, "Berlin depot");
      await userEvent.type(phone(), "+4915112345678");

      await userEvent.click(screen.getByRole("button", { name: "Add driver" }));

      expect(await screen.findByText("This user already has a driver profile")).toBeInTheDocument();
      expect(navigation.push).not.toHaveBeenCalled();
    });

    it("keeps what was typed and says so after a network failure", async () => {
      seedUsers();
      server.use(http.post(DRIVERS, () => HttpResponse.error()));
      renderInConsole(<DriverForm />, MANAGER);
      await userEvent.click(await screen.findByRole("combobox", { name: /^User/ }));
      await userEvent.click(await screen.findByRole("option", { name: /Dana Driver/ }));
      await choose(/^Branch/, "Berlin depot");
      await userEvent.type(phone(), "+4915112345678");

      await userEvent.click(screen.getByRole("button", { name: "Add driver" }));

      expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
      expect(phone()).toHaveValue("+4915112345678");
    });

    it("explains when nobody is waiting for a profile", async () => {
      server.use(
        http.get(USERS, () => page([])),
        http.get(DRIVERS, () => page([])),
      );
      renderInConsole(<DriverForm />, MANAGER);

      expect(await screen.findByText("No users are waiting for a driver profile")).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /^User/ })).toBeDisabled();
    });

    it("explains that a manager without users.view cannot choose a user, and never asks for the list", async () => {
      const requests = vi.fn();
      server.use(http.get(USERS, () => (requests(), page([]))));
      renderInConsole(<DriverForm />, { permissions: ["fleet.manage"], branches: BRANCHES });

      expect(await screen.findByText("You can't choose a user")).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /^User/ })).toBeDisabled();
      expect(requests).not.toHaveBeenCalled();
    });

    it("offers a retry when the users cannot be loaded", async () => {
      let calls = 0;
      server.use(
        http.get(USERS, () => {
          calls += 1;
          return calls <= 1 ? apiError(500, "server_error") : page([]);
        }),
        http.get(DRIVERS, () => page([])),
      );
      renderInConsole(<DriverForm />, MANAGER);

      await userEvent.click(await screen.findByRole("button", { name: "Try again" }));

      expect(await screen.findByText("No users are waiting for a driver profile")).toBeInTheDocument();
    });
  });

  describe("editing a driver", () => {
    it("starts from the saved values, shows the user read-only, and changes branch and phone only", async () => {
      let body: unknown;
      server.use(
        http.patch(DRIVER, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildDriver({ phone: "+4930111222" }));
        }),
      );
      renderInConsole(<DriverForm driver={buildDriver()} />, MANAGER);

      expect(screen.getByRole("textbox", { name: "User" })).toHaveValue("Dana Driver · dana.driver@example.test");
      expect(screen.getByRole("textbox", { name: "User" })).toHaveAttribute("readonly");
      expect(phone()).toHaveValue("+4915112345678");

      await userEvent.clear(phone());
      await userEvent.type(phone(), "+49 30 111222");
      await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => expect(body).toEqual({ branch_id: "b-1", phone: "+4930111222" }));
      expect(await screen.findByText("Driver Dana Driver updated")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/fleet/drivers/d-0001");
    });

    it("keeps the driver's current branch as an option even when it is not one of the user's", async () => {
      renderInConsole(
        <DriverForm driver={buildDriver({ branch: { public_id: "b-9", code: "MUC", name: "Munich yard" } })} />,
        MANAGER,
      );

      expect(screen.getByRole("combobox", { name: /^Branch/ })).toHaveTextContent("Munich yard");
    });

    it("closes with an error toast when the driver was archived meanwhile (409)", async () => {
      server.use(http.patch(DRIVER, () => apiError(409, "driver.archived")));
      renderInConsole(<DriverForm driver={buildDriver()} />, MANAGER);

      await userEvent.clear(phone());
      await userEvent.type(phone(), "+4930111222");
      await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

      expect(await screen.findByText("This driver was archived")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/fleet/drivers/d-0001");
    });
  });
});
