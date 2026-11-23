import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionProvider } from "@/features/session/session-context";
import { server } from "@/test/msw";
import { buildSession } from "@/test/session";
import { UserMenu } from "./user-menu";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const renderMenu = () =>
  render(
    <SessionProvider session={buildSession({ roles: ["ops_manager"] })}>
      <UserMenu />
    </SessionProvider>,
  );

describe("UserMenu", () => {
  beforeEach(() => {
    router.replace.mockReset();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("shows who is signed in with a readable role", () => {
    renderMenu();

    const trigger = screen.getByRole("button", { name: /account menu/ });
    expect(trigger).toHaveTextContent("Olivia Owner");
    expect(trigger).toHaveTextContent("Ops manager");
  });

  it("switches to the dark theme and remembers it", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: /account menu/ }));
    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("ff-theme")).toBe("dark");
  });

  it("signs out through the BFF and returns to sign in", async () => {
    let calls = 0;
    server.use(http.post("*/bff/auth/logout", () => ((calls += 1), new HttpResponse(null, { status: 204 }))));
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: /account menu/ }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(calls).toBe(1);
  });

  it("stays signed in and says so when sign out fails", async () => {
    server.use(http.post("*/bff/auth/logout", () => HttpResponse.error()));
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: /account menu/ }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't sign out");
    expect(router.replace).not.toHaveBeenCalled();
  });
});
