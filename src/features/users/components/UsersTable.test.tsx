import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { buildUser } from "@/test/users";
import { UsersTable } from "./UsersTable";

const navigation = vi.hoisted(() => ({ search: "", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => "/settings/users",
  useRouter: () => ({ push: navigation.push }),
}));

const USERS = "*/bff/api/v1/users/";
const page = (results: ReturnType<typeof buildUser>[], next: string | null = null, previous: string | null = null) =>
  HttpResponse.json({ results, next, previous });

describe("UsersTable", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.push.mockReset();
  });

  it("shows a skeleton, then one row per user with a link to the detail page", async () => {
    server.use(
      http.get(USERS, ({ request }) => {
        expect(new URL(request.url).searchParams.get("page_size")).toBe("25");
        return page([
          buildUser(),
          buildUser({ public_id: "u-2", full_name: "", email: "x@n.test", is_active: false, branches: [] }),
        ]);
      }),
    );
    renderWithQuery(<UsersTable />);

    expect(screen.getByRole("table", { name: "Users" })).toHaveAttribute("aria-busy", "true");

    const link = await screen.findByRole("link", { name: "Dana Dispatcher" });
    expect(link).toHaveAttribute("href", "/settings/users/01a2-0000-0000-0001");
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("Dispatcher")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Berlin Hub")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Never signed in")).toBeInTheDocument();
    expect(within(rows[1]!).getByRole("link", { name: "No name yet" })).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Deactivated")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("All branches")).toBeInTheDocument();
  });

  it("explains an empty company", async () => {
    server.use(http.get(USERS, () => page([])));
    renderWithQuery(<UsersTable />);

    expect(await screen.findByText("No users yet")).toBeInTheDocument();
  });

  it("shows an error with the request ID and recovers on retry", async () => {
    let calls = 0;
    server.use(
      http.get(USERS, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ code: "server_error", detail: "x", request_id: "req-42" }, { status: 500 })
          : page([buildUser()]);
      }),
    );
    renderWithQuery(<UsersTable />);

    expect(await screen.findByText("FleetFlow is unavailable")).toBeInTheDocument();
    expect(screen.getByText("Reference: req-42")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("link", { name: "Dana Dispatcher" })).toBeInTheDocument();
  });

  it("does not pretend to show users when the API refuses access", async () => {
    server.use(
      http.get(USERS, () =>
        HttpResponse.json({ code: "permission_denied", detail: "x", request_id: "r" }, { status: 403 }),
      ),
    );
    renderWithQuery(<UsersTable />);

    expect(await screen.findByText("You don't have access to this")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("pages with cursors from the API links and keeps the page size in the URL", async () => {
    navigation.search = "page_size=50&cursor=cur-2";
    server.use(
      http.get(USERS, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get("cursor")).toBe("cur-2");
        expect(params.get("page_size")).toBe("50");
        return page(
          [buildUser()],
          "http://api.test/api/v1/users/?cursor=cur-3&page_size=50",
          "http://api.test/api/v1/users/?cursor=cur-1&page_size=50",
        );
      }),
    );
    renderWithQuery(<UsersTable />);

    expect(await screen.findByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/settings/users?page_size=50&cursor=cur-3",
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/settings/users?page_size=50&cursor=cur-1",
    );

    await userEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await userEvent.click(screen.getByRole("option", { name: "100" }));
    expect(navigation.push).toHaveBeenCalledWith("/settings/users?page_size=100");
  });

  it("disables Previous on the first page and Next on the last", async () => {
    server.use(http.get(USERS, () => page([buildUser()])));
    renderWithQuery(<UsersTable />);

    expect(await screen.findByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
