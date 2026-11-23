import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { ResetPasswordForm } from "./reset-password-form";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const CONFIRM = "*/bff/auth/password-reset/confirm";

const submitPasswords = async (password: string, confirm = password) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("New password"), password);
  await user.type(screen.getByLabelText("Confirm new password"), confirm);
  await user.click(screen.getByRole("button", { name: "Save password" }));
};

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    navigation.replace.mockReset();
    navigation.search = "uid=01a2-uid&token=tok-123";
  });

  it("explains an incomplete link instead of showing the form", () => {
    navigation.search = "uid=01a2-uid";
    render(<ResetPasswordForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("This link is incomplete");
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
  });

  it("requires matching passwords before sending", async () => {
    render(<ResetPasswordForm />);

    await submitPasswords("Fleet-Ops-2026!", "Fleet-Ops-2027!");

    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
  });

  it("saves the password and returns to sign in with a notice", async () => {
    server.use(
      http.post(CONFIRM, async ({ request }) => {
        expect(await request.json()).toEqual({ uid: "01a2-uid", token: "tok-123", new_password: "Fleet-Ops-2026!" });
        return new HttpResponse(null, { status: 204 });
      }),
    );
    render(<ResetPasswordForm />);

    await submitPasswords("Fleet-Ops-2026!");

    expect(navigation.replace).toHaveBeenCalledWith("/login?notice=password_reset");
  });

  it("shows the API's password rules on the field", async () => {
    server.use(
      http.post(CONFIRM, () =>
        HttpResponse.json(
          {
            code: "validation.invalid",
            detail: "x",
            request_id: "r",
            errors: { new_password: ["This password is too common."] },
          },
          { status: 400 },
        ),
      ),
    );
    render(<ResetPasswordForm />);

    await submitPasswords("password123");

    expect(await screen.findByText("This password is too common.")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toHaveAttribute("aria-invalid", "true");
  });

  it("offers a new link when the token has expired", async () => {
    server.use(
      http.post(CONFIRM, () =>
        HttpResponse.json({ code: "auth.invalid_reset_token", detail: "x", request_id: "r" }, { status: 400 }),
      ),
    );
    render(<ResetPasswordForm />);

    await submitPasswords("Fleet-Ops-2026!");

    expect(await screen.findByRole("alert")).toHaveTextContent("This link has expired or was already used");
    expect(screen.getByRole("link", { name: "Request a new link" })).toHaveAttribute("href", "/forgot-password");
  });
});
