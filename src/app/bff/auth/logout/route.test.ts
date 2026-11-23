// @vitest-environment node
import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { server, TEST_API } from "@/test/msw";
import { POST } from "./route";

const logoutRequest = () =>
  new NextRequest("http://admin.test/bff/auth/logout", {
    method: "POST",
    body: "{}",
    headers: {
      origin: "http://admin.test",
      host: "admin.test",
      "content-type": "application/json",
      cookie: "ff_access=a; ff_refresh=r-token",
    },
  });

describe("POST /bff/auth/logout", () => {
  it("ends the session at the API and clears both cookies", async () => {
    let sent: unknown = null;
    server.use(
      http.post(`${TEST_API}/auth/logout/`, async ({ request }) => {
        sent = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const response = await POST(logoutRequest());

    expect(response.status).toBe(204);
    expect(sent).toEqual({ refresh: "r-token" });
    expect(response.cookies.get("ff_access")?.value).toBe("");
    expect(response.cookies.get("ff_refresh")?.value).toBe("");
  });

  it("still clears the cookies when the API is unreachable", async () => {
    server.use(http.post(`${TEST_API}/auth/logout/`, () => HttpResponse.error()));

    const response = await POST(logoutRequest());

    expect(response.status).toBe(204);
    expect(response.cookies.get("ff_refresh")?.value).toBe("");
  });
});
