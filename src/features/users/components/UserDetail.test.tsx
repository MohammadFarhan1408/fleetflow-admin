import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw";
import { renderWithQuery } from "@/test/render";
import { buildUser } from "@/test/users";
import { UserDetail } from "./UserDetail";

const DETAIL = "*/bff/api/v1/users/:id/";

describe("UserDetail", () => {
  it("shows the user's access and account facts", async () => {
    server.use(
      http.get(DETAIL, ({ params }) => {
        expect(params.id).toBe("u-1");
        return HttpResponse.json(buildUser({ roles: ["ops_manager", "dispatcher"], branches: [] }));
      }),
    );
    renderWithQuery(<UserDetail publicId="u-1" />);

    expect(await screen.findByRole("heading", { level: 1, name: "Dana Dispatcher" })).toBeInTheDocument();
    expect(screen.getByText("Ops manager")).toBeInTheDocument();
    expect(screen.getByText("All branches")).toBeInTheDocument();
    expect(screen.getAllByText("Active")).toHaveLength(2);
    expect(screen.getByText("Never signed in")).toBeInTheDocument();
  });

  it("shows a not-found state for a user outside the company", async () => {
    server.use(
      http.get(DETAIL, () => HttpResponse.json({ code: "not_found", detail: "x", request_id: "r" }, { status: 404 })),
    );
    renderWithQuery(<UserDetail publicId="u-other" />);

    expect(await screen.findByText("User not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to users" })).toHaveAttribute("href", "/settings/users");
  });
});
