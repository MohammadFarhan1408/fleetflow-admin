import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { SessionProvider, type Session } from "@/features/session/SessionContext";
import { buildSession } from "@/test/session";
import { BranchSwitcher } from "./BranchSwitcher";

const BERLIN = { public_id: "b-1", name: "Berlin Hub" };
const HAMBURG = { public_id: "b-2", name: "Hamburg Port" };

const renderSwitcher = (branches: Session["branches"]) =>
  render(
    <SessionProvider session={buildSession({ branches })}>
      <BranchSwitcher />
    </SessionProvider>,
  );

describe("BranchSwitcher", () => {
  beforeEach(() => localStorage.clear());

  it("renders nothing for company-wide users", () => {
    const { container } = renderSwitcher([]);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a single branch as a label, not a menu", () => {
    renderSwitcher([BERLIN]);
    expect(screen.getByText("Berlin Hub")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lets a multi-branch user pick a branch and remembers it", async () => {
    const user = userEvent.setup();
    renderSwitcher([BERLIN, HAMBURG]);

    await user.click(screen.getByRole("button", { name: "Branch: All branches" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Hamburg Port" }));

    expect(screen.getByRole("button", { name: "Branch: Hamburg Port" })).toBeInTheDocument();
    expect(localStorage.getItem("ff-branch")).toBe("b-2");
  });

  it("falls back to all branches when the saved branch is no longer the user's", () => {
    localStorage.setItem("ff-branch", "b-gone");
    renderSwitcher([BERLIN, HAMBURG]);
    expect(screen.getByRole("button", { name: "Branch: All branches" })).toBeInTheDocument();
  });
});
