import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildCustomer } from "@/test/customers";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { CustomerForm } from "./CustomerForm";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push }) }));

const CUSTOMERS = "*/bff/api/v1/customers/";
const CUSTOMER = "*/bff/api/v1/customers/:id/";
const apiError = (status: number, code: string, errors?: Record<string, string[]>) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", errors }, { status });

const MANAGER = { permissions: ["customers.manage"] };
const renderForm = (customer?: ReturnType<typeof buildCustomer>) =>
  renderInConsole(<CustomerForm customer={customer} />, MANAGER);

const NAME = /^(Company|Full) name$/;
const name = () => screen.getByRole("textbox", { name: NAME });
const submit = (label: "Add customer" | "Save changes") => screen.getByRole("button", { name: label });
const fill = async (value: string, extra: { email?: string; phone?: string } = {}) => {
  // Typing a long value re-renders the live preview per character and takes seconds; pasting is one change.
  if (value.length > 50) {
    await userEvent.click(name());
    await userEvent.paste(value);
  } else {
    await userEvent.type(name(), value);
  }
  if (extra.email) await userEvent.type(screen.getByRole("textbox", { name: /Email/ }), extra.email);
  if (extra.phone) await userEvent.type(screen.getByRole("textbox", { name: /Phone/ }), extra.phone);
};

describe("CustomerForm", () => {
  beforeEach(() => navigation.push.mockReset());

  describe("adding a customer", () => {
    it("creates the customer with an idempotency key, confirms, and opens the new customer", async () => {
      let body: unknown;
      let key: string | null = null;
      server.use(
        http.post(CUSTOMERS, async ({ request }) => {
          body = await request.json();
          key = request.headers.get("idempotency-key");
          return HttpResponse.json(buildCustomer({ public_id: "c-new", name: "Acme Ltd" }), { status: 201 });
        }),
      );
      renderForm();

      await fill("  Acme Ltd ", { email: "ops@acme.test", phone: "+14155550123" });
      await userEvent.click(submit("Add customer"));

      expect(await screen.findByText("Customer Acme Ltd added")).toBeInTheDocument();
      expect(body).toEqual({ kind: "business", name: "Acme Ltd", email: "ops@acme.test", phone: "+14155550123" });
      expect(key).toMatch(/^[0-9a-f-]{36}$/);
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-new");
    });

    it("starts empty again after saving, because Next keeps this page mounted when it navigates away", async () => {
      server.use(http.post(CUSTOMERS, () => HttpResponse.json(buildCustomer({ public_id: "c-new" }), { status: 201 })));
      renderForm();

      await fill("Acme");
      await userEvent.click(submit("Add customer"));
      await screen.findByText("Customer Northwind Traders added");

      expect(name()).toHaveValue("");
      navigation.push.mockReset();
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(navigation.push).toHaveBeenCalledWith("/customers");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("lets the user pick the type with cards, and words the name field for it", async () => {
      let body: { kind?: string } = {};
      server.use(
        http.post(CUSTOMERS, async ({ request }) => {
          body = (await request.json()) as { kind?: string };
          return HttpResponse.json(buildCustomer({ public_id: "c-new" }), { status: 201 });
        }),
      );
      renderForm();

      const business = screen.getByRole("radio", { name: "Business" });
      const individual = screen.getByRole("radio", { name: "Individual" });
      expect(screen.getByRole("radiogroup", { name: "Customer type" })).toBeInTheDocument();
      expect(business).toBeChecked();
      expect(business).toHaveAccessibleDescription("A company that ships with you.");
      expect(screen.getByRole("textbox", { name: "Company name" })).toHaveAttribute("placeholder", "Northwind Traders");

      await userEvent.click(individual);

      expect(individual).toBeChecked();
      expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute("placeholder", "Ada Lovelace");
      await fill("Ada Lovelace");
      await userEvent.click(submit("Add customer"));
      await waitFor(() => expect(body.kind).toBe("individual"));
    });

    // The arrow keys themselves are Radix's; the browser run covers them. Here: the cards are one tab stop.
    it("makes the type cards a single tab stop", () => {
      renderForm();

      expect(screen.getByRole("radiogroup", { name: "Customer type" })).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("radio", { name: "Business" })).toHaveAttribute("tabindex", "-1");
      expect(screen.getByRole("radio", { name: "Individual" })).toHaveAttribute("tabindex", "-1");
    });

    it("accepts a phone number typed with spaces and sends it in the format the API requires", async () => {
      let body: { phone?: string } = {};
      server.use(
        http.post(CUSTOMERS, async ({ request }) => {
          body = (await request.json()) as { phone?: string };
          return HttpResponse.json(buildCustomer({ public_id: "c-new" }), { status: 201 });
        }),
      );
      renderForm();

      await fill("Acme", { phone: "+1 (415) 555-0123" });
      await userEvent.click(submit("Add customer"));

      await waitFor(() => expect(body.phone).toBe("+14155550123"));
      expect(screen.queryByText(/Include the country code/)).not.toBeInTheDocument();
    });

    it("previews the customer as it is typed", async () => {
      renderForm();
      expect(screen.getByText("Customer name")).toBeInTheDocument();

      await fill("Acme Ltd", { email: "ops@acme.test" });

      expect(screen.getByText("Acme Ltd")).toBeInTheDocument();
      expect(screen.getByText("AL")).toBeInTheDocument();
      expect(screen.getByText("ops@acme.test")).toBeInTheDocument();
    });

    it("marks required fields with an asterisk and says nothing about optional ones", () => {
      renderForm();

      expect(screen.getByRole("textbox", { name: "Company name" })).toBeRequired();
      expect(screen.getByRole("radiogroup", { name: "Customer type" })).toBeRequired();
      expect(screen.getByRole("textbox", { name: /Email/ })).not.toBeRequired();
      expect(screen.getByRole("textbox", { name: /Phone/ })).not.toBeRequired();
      // The asterisk is visual only, so it does not become part of the field's name.
      expect(screen.getAllByText("*")).toHaveLength(2);
      expect(screen.queryByText(/optional/i)).not.toBeInTheDocument();
    });

    it("says when there are unsaved changes", async () => {
      renderForm();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      await fill("Acme");

      expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes");
    });

    it("shows specific messages and sends nothing for invalid input", async () => {
      const requests = vi.fn();
      server.use(http.post(CUSTOMERS, () => (requests(), HttpResponse.json(buildCustomer(), { status: 201 }))));
      renderForm();

      await userEvent.click(submit("Add customer"));
      expect(await screen.findByText("Enter the customer's name")).toBeInTheDocument();

      await fill("x".repeat(201), { email: "not-an-email", phone: "415 555" });
      await userEvent.click(submit("Add customer"));

      expect(await screen.findByText("Name must be 200 characters or fewer")).toBeInTheDocument();
      expect(screen.getByText("Enter a valid email address, like name@company.com")).toBeInTheDocument();
      expect(screen.getByText("Include the country code, like +1 415 555 0123")).toBeInTheDocument();
      expect(requests).not.toHaveBeenCalled();
    });

    it("accepts a name of exactly 200 characters and sends empty email and phone as empty strings", async () => {
      let body: unknown;
      server.use(
        http.post(CUSTOMERS, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildCustomer({ public_id: "c-new" }), { status: 201 });
        }),
      );
      renderForm();

      await fill("x".repeat(200));
      await userEvent.click(submit("Add customer"));

      await waitFor(() => expect(body).toEqual({ kind: "business", name: "x".repeat(200), email: "", phone: "" }));
    });

    it("puts the API's field errors on the fields and focuses the first", async () => {
      server.use(
        http.post(CUSTOMERS, () => apiError(400, "validation.invalid", { email: ["Enter a valid email address."] })),
      );
      renderForm();

      await fill("Acme", { email: "a@b.co" });
      await userEvent.click(submit("Add customer"));

      expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /Email/ })).toHaveFocus();
      expect(navigation.push).not.toHaveBeenCalled();
    });

    it("shows errors for unknown fields in an alert", async () => {
      server.use(
        http.post(CUSTOMERS, () => apiError(400, "validation.invalid", { non_field_errors: ["Not allowed."] })),
      );
      renderForm();

      await fill("Acme");
      await userEvent.click(submit("Add customer"));

      expect(await screen.findByRole("alert")).toHaveTextContent("Not allowed.");
    });

    it("keeps the values after a network failure and retries with the same idempotency key", async () => {
      const keys: (string | null)[] = [];
      server.use(
        http.post(CUSTOMERS, ({ request }) => {
          keys.push(request.headers.get("idempotency-key"));
          return keys.length === 1
            ? HttpResponse.error()
            : HttpResponse.json(buildCustomer({ public_id: "c-new", name: "Acme" }), { status: 201 });
        }),
      );
      renderForm();

      await fill("Acme");
      await userEvent.click(submit("Add customer"));
      expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
      expect(name()).toHaveValue("Acme");

      await userEvent.click(submit("Add customer"));
      expect(await screen.findByText("Customer Acme added")).toBeInTheDocument();
      expect(keys).toHaveLength(2);
      expect(keys[0]).toBe(keys[1]);
    });

    it("sends one request when the button is pressed twice", async () => {
      const requests = vi.fn();
      server.use(
        http.post(CUSTOMERS, async () => {
          requests();
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(buildCustomer({ public_id: "c-new" }), { status: 201 });
        }),
      );
      renderForm();

      await fill("Acme");
      await userEvent.dblClick(submit("Add customer"));

      await screen.findByText(/Customer .* added/);
      expect(requests).toHaveBeenCalledTimes(1);
    });

    it("does not claim success when the API refuses: an error toast, back to the list", async () => {
      server.use(http.post(CUSTOMERS, () => apiError(403, "permission.denied")));
      renderForm();

      await fill("Acme");
      await userEvent.click(submit("Add customer"));

      expect(await screen.findByText("You don't have permission to do this")).toBeInTheDocument();
      expect(screen.queryByText(/added/)).not.toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/customers");
    });

    it("leaves straight away on Cancel when nothing was typed", async () => {
      renderForm();

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(navigation.push).toHaveBeenCalledWith("/customers");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("asks before discarding changes: 'Keep editing' stays, 'Discard changes' leaves", async () => {
      renderForm();
      await fill("Acme");

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(await screen.findByRole("dialog", { name: "Discard your changes?" })).toBeInTheDocument();
      expect(navigation.push).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "Keep editing" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(name()).toHaveValue("Acme");

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      await userEvent.click(await screen.findByRole("button", { name: "Discard changes" }));
      expect(navigation.push).toHaveBeenCalledWith("/customers");
    });

    it("warns the browser before a reload while there are unsaved changes", async () => {
      renderForm();
      const beforeUnload = () => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(beforeUnload()).toBe(false);
      await fill("Acme");
      expect(beforeUnload()).toBe(true);
    });
  });

  describe("editing a customer", () => {
    it("starts with the saved values and saves the changes with an idempotency key", async () => {
      let request: { id?: string; body?: unknown; key?: string | null } = {};
      server.use(
        http.patch(CUSTOMER, async ({ params, request: incoming }) => {
          request = {
            id: String(params.id),
            body: await incoming.json(),
            key: incoming.headers.get("idempotency-key"),
          };
          return HttpResponse.json(buildCustomer({ name: "Northwind Group" }));
        }),
      );
      renderForm(buildCustomer());

      expect(name()).toHaveValue("Northwind Traders");
      expect(screen.getByRole("textbox", { name: /Email/ })).toHaveValue("ops@northwind.test");
      expect(screen.getByRole("textbox", { name: /Phone/ })).toHaveValue("+4930123456");

      await userEvent.clear(name());
      await userEvent.type(name(), "Northwind Group");
      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("Customer Northwind Group updated")).toBeInTheDocument();
      expect(request.id).toBe("c-0001");
      expect(request.body).toEqual({
        kind: "business",
        name: "Northwind Group",
        email: "ops@northwind.test",
        phone: "+4930123456",
      });
      expect(request.key).toMatch(/^[0-9a-f-]{36}$/);
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-0001");
    });

    it("is not changed after saving: Cancel leaves without asking", async () => {
      server.use(http.patch(CUSTOMER, () => HttpResponse.json(buildCustomer({ name: "Northwind Group" }))));
      renderForm(buildCustomer());

      await userEvent.clear(name());
      await userEvent.type(name(), "Northwind Group");
      await userEvent.click(submit("Save changes"));
      await screen.findByText("Customer Northwind Group updated");
      navigation.push.mockReset();

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(navigation.push).toHaveBeenCalledWith("/customers/c-0001");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("tells the user when someone archived the customer meanwhile and goes back to the customer", async () => {
      server.use(http.patch(CUSTOMER, () => apiError(409, "customer.archived")));
      renderForm(buildCustomer());

      await userEvent.type(name(), " II");
      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("This customer was archived")).toBeInTheDocument();
      expect(screen.queryByText(/updated/)).not.toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledWith("/customers/c-0001");
    });

    it("returns to the list when the customer no longer exists", async () => {
      server.use(http.patch(CUSTOMER, () => apiError(404, "not_found")));
      renderForm(buildCustomer());

      await userEvent.type(name(), " II");
      await userEvent.click(submit("Save changes"));

      expect(await screen.findByText("This no longer exists")).toBeInTheDocument();
      expect(navigation.push).toHaveBeenCalledTimes(1);
      expect(navigation.push).toHaveBeenCalledWith("/customers");
    });

    it("goes back to the customer on Cancel", async () => {
      renderForm(buildCustomer());

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(navigation.push).toHaveBeenCalledWith("/customers/c-0001");
    });
  });

  // Next keeps the previous page mounted but hidden, so the add form and the edit form can coexist.
  it("ties each label to its own input when two forms are on the page", async () => {
    renderInConsole(
      <>
        <CustomerForm />
        <CustomerForm customer={buildCustomer()} />
      </>,
      MANAGER,
    );

    const [, secondName] = screen.getAllByRole("textbox", { name: NAME });
    await userEvent.click(screen.getAllByText("Company name")[1]!);

    expect(secondName).toHaveFocus();
  });
});
