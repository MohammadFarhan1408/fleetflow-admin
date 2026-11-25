import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildAddress } from "@/test/customers";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { AddressForm } from "./AddressForm";

// Opening the country list renders 249 options in jsdom, and the file's first test also pays the cold start.
vi.setConfig({ testTimeout: 20_000 });

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const ADDRESSES = "*/bff/api/v1/customers/:customerId/addresses/";
const ADDRESS = "*/bff/api/v1/customers/:customerId/addresses/:id/";
const apiError = (status: number, code: string, errors?: Record<string, string[]>) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", errors }, { status });

const renderForm = (address?: ReturnType<typeof buildAddress>) =>
  renderInConsole(<AddressForm customerId="c-1" address={address} />, { permissions: ["customers.manage"] });

const box = (name: RegExp | string) => screen.getByRole("textbox", { name });
const chooseCountry = async (label: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: /Country/ }));
  await userEvent.click(await screen.findByRole("option", { name: label }));
};
const fillRequired = async () => {
  await userEvent.type(box(/Address line 1/), "Hafenstrasse 4");
  await userEvent.type(box(/^City/), "Berlin");
  await chooseCountry("Germany");
};
const submit = (label: "Add address" | "Save changes") => screen.getByRole("button", { name: label });

describe("AddressForm", () => {
  beforeEach(() => navigation.push.mockReset());

  describe("adding an address", () => {
    it("creates it for the customer with an idempotency key, confirms, and returns to the customer", async () => {
      let request: { customerId?: string; body?: unknown; key?: string | null } = {};
      server.use(
        http.post(ADDRESSES, async ({ params, request: incoming }) => {
          request = {
            customerId: String(params.customerId),
            body: await incoming.json(),
            key: incoming.headers.get("idempotency-key"),
          };
          return HttpResponse.json(buildAddress({ label: "Depot" }), { status: 201 });
        }),
      );
      renderForm();

      await fillRequired();
      await userEvent.type(box(/Phone/), "+49 30 123456");
      await userEvent.click(submit("Add address"));

      expect(await screen.findByText("Address Depot added")).toBeInTheDocument();
      expect(request.customerId).toBe("c-1");
      expect(request.body).toMatchObject({
        line1: "Hafenstrasse 4",
        city: "Berlin",
        country: "DE",
        phone: "+4930123456",
        latitude: null,
        longitude: null,
      });
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-1");
    });

    it("marks the required fields and no others", () => {
      renderForm();

      for (const name of [/Address line 1/, /^City/]) expect(box(name)).toBeRequired();
      expect(screen.getByRole("combobox", { name: /Country/ })).toHaveAttribute("aria-required", "true");
      for (const name of [/Address line 2/, /Label/, /Contact name/, /Phone/, /Latitude/, /Longitude/]) {
        expect(box(name)).not.toBeRequired();
      }
    });

    it("asks for the missing required fields and sends nothing", async () => {
      const requests = vi.fn();
      server.use(http.post(ADDRESSES, () => (requests(), HttpResponse.json(buildAddress()))));
      renderForm();

      await userEvent.click(submit("Add address"));

      expect(await screen.findByText("Enter the street address")).toBeInTheDocument();
      expect(screen.getByText("Enter the city")).toBeInTheDocument();
      expect(screen.getByText("Choose a country", { selector: "p" })).toBeInTheDocument();
      expect(requests).not.toHaveBeenCalled();
    });

    it("needs both coordinates or neither, and keeps them in range", async () => {
      renderForm();
      await fillRequired();

      await userEvent.type(box(/Latitude/), "52.52");
      await userEvent.click(submit("Add address"));
      expect(await screen.findByText("Enter both latitude and longitude, or leave both empty")).toBeInTheDocument();

      await userEvent.type(box(/Longitude/), "181");
      await userEvent.click(submit("Add address"));
      expect(await screen.findByText("Enter longitude as a number from -180 to 180")).toBeInTheDocument();
    });

    it("sends coordinates as numbers", async () => {
      let body: { latitude?: number; longitude?: number } = {};
      server.use(
        http.post(ADDRESSES, async ({ request }) => {
          body = (await request.json()) as typeof body;
          return HttpResponse.json(buildAddress(), { status: 201 });
        }),
      );
      renderForm();
      await fillRequired();

      await userEvent.type(box(/Latitude/), "52.52");
      await userEvent.type(box(/Longitude/), "13.405");
      await userEvent.click(submit("Add address"));

      await waitFor(() => expect(body).toMatchObject({ latitude: 52.52, longitude: 13.405 }));
    });

    it("starts empty again after saving, because Next keeps this page mounted when it navigates away", async () => {
      server.use(http.post(ADDRESSES, () => HttpResponse.json(buildAddress(), { status: 201 })));
      renderForm();
      await fillRequired();
      await userEvent.click(submit("Add address"));
      await screen.findByText("Address Main warehouse added");

      expect(box(/Address line 1/)).toHaveValue("");
      expect(screen.getByRole("combobox", { name: /Country/ })).toHaveTextContent("Choose a country");
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    });

    it("reuses the idempotency key when the same body is retried after a network failure", async () => {
      const keys: (string | null)[] = [];
      let attempts = 0;
      server.use(
        http.post(ADDRESSES, ({ request }) => {
          keys.push(request.headers.get("idempotency-key"));
          return ++attempts === 1 ? HttpResponse.error() : HttpResponse.json(buildAddress(), { status: 201 });
        }),
      );
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add address"));
      expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
      await userEvent.click(submit("Add address"));

      await waitFor(() => expect(keys).toHaveLength(2));
      expect(keys[0]).toBe(keys[1]);
    });
  });

  describe("API failures", () => {
    it("puts the API's field errors on the fields", async () => {
      server.use(
        http.post(ADDRESSES, () =>
          apiError(400, "validation.invalid", { postal_code: ["Postal code is not valid for this country."] }),
        ),
      );
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add address"));

      expect(await screen.findByText("Postal code is not valid for this country.")).toBeInTheDocument();
      expect(box(/Postal code/)).toHaveAccessibleDescription("Postal code is not valid for this country.");
      expect(navigation.push).not.toHaveBeenCalled();
    });

    it("leaves the form when the customer was archived meanwhile", async () => {
      server.use(http.post(ADDRESSES, () => apiError(409, "customer.archived")));
      renderForm();
      await fillRequired();

      await userEvent.click(submit("Add address"));

      expect(await screen.findByText("This customer was archived")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-1");
    });

    it("goes back to the customer when the address was removed", async () => {
      server.use(http.patch(ADDRESS, () => apiError(404, "not_found")));
      renderForm(buildAddress());
      await userEvent.type(box(/Label/), " 2");

      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("This no longer exists")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-1");
    });
  });

  describe("editing an address", () => {
    it("starts with the saved values and saves the changes", async () => {
      let request: { id?: string; body?: Record<string, unknown> } = {};
      server.use(
        http.patch(ADDRESS, async ({ params, request: incoming }) => {
          request = { id: String(params.id), body: (await incoming.json()) as Record<string, unknown> };
          return HttpResponse.json(buildAddress({ label: "Main depot" }));
        }),
      );
      renderForm(buildAddress({ latitude: 52.52, longitude: 13.4 }));

      expect(box(/Address line 1/)).toHaveValue("Hafenstrasse 4");
      expect(box(/Latitude/)).toHaveValue("52.52");
      expect(screen.getByRole("combobox", { name: /Country/ })).toHaveTextContent("Germany");
      expect(box(/Address line 1/)).not.toHaveFocus();

      await userEvent.clear(box(/Label/));
      await userEvent.type(box(/Label/), "Main depot");
      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("Address Main depot updated")).toBeInTheDocument();
      expect(request.id).toBe("a-0001");
      expect(request.body).toMatchObject({ label: "Main depot", country: "DE", latitude: 52.52, longitude: 13.4 });
    });

    it("removes the saved point when both coordinates are cleared", async () => {
      let body: Record<string, unknown> = {};
      server.use(
        http.patch(ADDRESS, async ({ request }) => {
          body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(buildAddress());
        }),
      );
      renderForm(buildAddress({ latitude: 52.52, longitude: 13.4 }));

      await userEvent.clear(box(/Latitude/));
      await userEvent.clear(box(/Longitude/));
      await userEvent.click(submit("Save changes"));

      await waitFor(() => expect(body).toMatchObject({ latitude: null, longitude: null }));
    });
  });

  describe("leaving the form", () => {
    it("asks before discarding changes, and leaves without asking when nothing changed", async () => {
      renderForm();

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-1");
      navigation.push.mockReset();

      await userEvent.type(box(/^City/), "Berlin");
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(await screen.findByRole("dialog", { name: "Discard your changes?" })).toBeInTheDocument();
      expect(navigation.push).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "Discard changes" }));
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-1");
    });

    it("warns the browser before a reload while there are unsaved changes", async () => {
      renderForm();
      const beforeUnload = () => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(beforeUnload()).toBe(false);
      await userEvent.type(box(/^City/), "Berlin");
      expect(beforeUnload()).toBe(true);
    });
  });
});
