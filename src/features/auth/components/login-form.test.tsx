import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { LoginForm } from "./login-form";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const LOGIN = "*/bff/auth/login";

const fillAndSubmit = async (email = "olivia@example.test", password = "secret-pass") => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
};

describe("LoginForm", () => {
  beforeEach(() => {
    navigation.replace.mockReset();
    navigation.search = "";
  });

  it("shows field errors and sends nothing when submitted empty", async () => {
    let requests = 0;
    server.use(http.post(LOGIN, () => ((requests += 1), new HttpResponse(null, { status: 204 }))));
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter your email address")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(requests).toBe(0);
  });

  it("signs in and goes to the requested page", async () => {
    navigation.search = "next=%2Fusers%3Ftab%3Droles";
    server.use(
      http.post(LOGIN, async ({ request }) => {
        expect(await request.json()).toEqual({ email: "olivia@example.test", password: "secret-pass" });
        return new HttpResponse(null, { status: 204 });
      }),
    );
    render(<LoginForm />);

    await fillAndSubmit();

    expect(navigation.replace).toHaveBeenCalledWith("/users?tab=roles");
  });

  it("ignores an off-site next parameter", async () => {
    navigation.search = "next=https%3A%2F%2Fevil.example";
    server.use(http.post(LOGIN, () => new HttpResponse(null, { status: 204 })));
    render(<LoginForm />);

    await fillAndSubmit();

    expect(navigation.replace).toHaveBeenCalledWith("/");
  });

  it("says the credentials are wrong without saying which one", async () => {
    server.use(
      http.post(LOGIN, () =>
        HttpResponse.json({ code: "auth.invalid_credentials", detail: "x", request_id: "r" }, { status: 401 }),
      ),
    );
    render(<LoginForm />);

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect");
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("tells a locked-out user how long to wait", async () => {
    server.use(
      http.post(LOGIN, () =>
        HttpResponse.json(
          { code: "auth.account_locked", detail: "x", request_id: "r" },
          { status: 429, headers: { "Retry-After": "900" } },
        ),
      ),
    );
    render(<LoginForm />);

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Try again in 15 minutes.");
  });

  it("shows a connection message and keeps the values when the network fails", async () => {
    server.use(http.post(LOGIN, () => HttpResponse.error()));
    render(<LoginForm />);

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach FleetFlow");
    expect(screen.getByLabelText("Email")).toHaveValue("olivia@example.test");
  });

  it("shows the session-expired notice from the URL", () => {
    navigation.search = "notice=session_expired";
    render(<LoginForm />);

    expect(screen.getByRole("status")).toHaveTextContent("Your session ended");
  });
});
