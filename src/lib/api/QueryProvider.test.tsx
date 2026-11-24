import { useQuery } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { apiClient, unwrap } from "./client";
import { QueryProvider } from "./QueryProvider";

const Me = () => {
  useQuery({ queryKey: ["me"], queryFn: () => unwrap(apiClient.GET("/api/v1/me/")) });
  return null;
};

describe("QueryProvider", () => {
  const original = window.location;
  afterEach(() => Object.defineProperty(window, "location", { value: original, configurable: true }));

  it("sends the user to sign in, keeping the page, when the session has ended", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...original, pathname: "/settings/users", search: "?cursor=c1", assign },
      configurable: true,
    });
    server.use(
      http.get("*/bff/api/v1/me/", () =>
        HttpResponse.json({ code: "auth.token_invalid", detail: "x", request_id: "r" }, { status: 401 }),
      ),
    );

    render(
      <QueryProvider>
        <Me />
      </QueryProvider>,
    );

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("/login?next=%2Fsettings%2Fusers%3Fcursor%3Dc1&notice=session_expired"),
    );
  });
});
