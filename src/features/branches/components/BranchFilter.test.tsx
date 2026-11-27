import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { branchesHandler, BRANCH_LIST, buildBranch } from "@/test/branches";
import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { BranchFilter } from "./BranchFilter";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => "/fleet/vehicles",
  useRouter: () => ({ replace: navigation.replace }),
}));

const BER = "01a213c7-d837-7783-84b4-72fc434d1041";
const HAM = "01a21e3d-8fc5-74dd-b20c-e5a72761d912";
const TWO = [buildBranch({ public_id: BER }), buildBranch({ public_id: HAM, code: "HAM", name: "Hamburg hub" })];

describe("BranchFilter", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("lists the branches, writes the choice to the URL and drops the page cursor", async () => {
    navigation.search = "status=active&cursor=c1";
    server.use(branchesHandler(TWO));
    renderWithQuery(<BranchFilter />);

    await userEvent.click(await screen.findByRole("button", { name: "Branch" }));
    await userEvent.click(await screen.findByRole("radio", { name: "Hamburg hub" }));

    expect(navigation.replace).toHaveBeenCalledWith(`/fleet/vehicles?status=active&branch=${HAM}`, { scroll: false });
  });

  it("names the chosen branch and clears it", async () => {
    navigation.search = `branch=${HAM}`;
    server.use(branchesHandler(TWO));
    renderWithQuery(<BranchFilter />);

    expect(await screen.findByRole("button", { name: "Branch: Hamburg hub" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear Branch filter" }));

    expect(navigation.replace).toHaveBeenCalledWith("/fleet/vehicles", { scroll: false });
  });

  it.each([
    ["one branch", [buildBranch({ public_id: BER })]],
    ["no branch", []],
  ])("is hidden with %s: there is nothing to choose", async (_name, branches) => {
    let asked = false;
    server.use(
      http.get(BRANCH_LIST, () => {
        asked = true;
        return HttpResponse.json({ results: branches, next: null, previous: null });
      }),
    );
    renderWithQuery(<BranchFilter />);

    await vi.waitFor(() => expect(asked).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("button", { name: /Branch/ })).not.toBeInTheDocument();
  });

  it("is hidden while the branches load, so a valid branch is never shown as unknown", async () => {
    navigation.search = `branch=${HAM}`;
    server.use(http.get(BRANCH_LIST, () => new Promise(() => {})));
    renderWithQuery(<BranchFilter />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("button", { name: /Branch/ })).not.toBeInTheDocument();
  });

  it("shows a branch the caller cannot see as unknown, even with one branch, and can clear it", async () => {
    navigation.search = `branch=${HAM}`;
    server.use(branchesHandler([buildBranch({ public_id: BER })]));
    renderWithQuery(<BranchFilter />);

    expect(await screen.findByRole("button", { name: "Branch: Unknown branch" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear Branch filter" }));

    expect(navigation.replace).toHaveBeenCalledWith("/fleet/vehicles", { scroll: false });
  });

  it("keeps a clearable chip when the branch list fails to load", async () => {
    navigation.search = `branch=${HAM}`;
    server.use(http.get(BRANCH_LIST, () => HttpResponse.json({ code: "x" }, { status: 500 })));
    renderWithQuery(<BranchFilter />);

    expect(await screen.findByRole("button", { name: "Branch: Selected branch" })).toBeInTheDocument();
  });

  it("ignores a value that is not a branch id", async () => {
    navigation.search = "branch=not-a-uuid";
    server.use(branchesHandler([buildBranch({ public_id: BER })]));
    renderWithQuery(<BranchFilter />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("button", { name: /Branch/ })).not.toBeInTheDocument();
  });
});
