import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildSession } from "@/test/session";
import { RequirePermission } from "./RequirePermission";

const me = vi.hoisted(() => ({ permissions: [] as string[] }));
// getMe calls fleetflow-api through cookies(); the guard's own rule is what is under test here.
vi.mock("@/lib/server/session", () => ({ getMe: async () => buildSession({ permissions: me.permissions }) }));

describe("RequirePermission", () => {
  it("renders the page for a permitted user", async () => {
    me.permissions = ["users.view"];
    render(await RequirePermission({ permission: "users.view", children: <p>Users list</p> }));

    expect(screen.getByText("Users list")).toBeInTheDocument();
  });

  it("renders the 403 state instead of the page otherwise", async () => {
    me.permissions = ["customers.view"];
    render(await RequirePermission({ permission: "users.view", children: <p>Users list</p> }));

    expect(screen.getByRole("heading", { name: "You don't have access to this page" })).toBeInTheDocument();
    expect(screen.queryByText("Users list")).not.toBeInTheDocument();
  });
});
