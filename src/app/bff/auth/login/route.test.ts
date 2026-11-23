// @vitest-environment node
import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { fakeJwt, server, TEST_API } from "@/test/msw";
import { POST } from "./route";

const loginRequest = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest("http://admin.test/bff/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { origin: "http://admin.test", host: "admin.test", "content-type": "application/json", ...headers },
  });

describe("POST /bff/auth/login", () => {
  it("stores the tokens in httpOnly cookies and never returns them to the browser", async () => {
    const tokens = { access: fakeJwt(900), refresh: fakeJwt(2_592_000) };
    let forwarded: { body: unknown; ip: string | null } | null = null;
    server.use(
      http.post(`${TEST_API}/auth/login/`, async ({ request }) => {
        forwarded = { body: await request.json(), ip: request.headers.get("x-forwarded-for") };
        return HttpResponse.json(tokens);
      }),
    );

    const response = await POST(
      loginRequest(
        { email: "a@b.test", password: "pw", is_admin: true },
        { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
      ),
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(forwarded).toEqual({ body: { email: "a@b.test", password: "pw" }, ip: "203.0.113.7" });
    const access = response.cookies.get("ff_access");
    expect(access).toMatchObject({ value: tokens.access, httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(access?.maxAge).toBeGreaterThan(890);
    expect(response.cookies.get("ff_refresh")?.maxAge).toBeGreaterThan(2_591_000);
  });

  it("relays API errors with Retry-After and the request ID", async () => {
    server.use(
      http.post(`${TEST_API}/auth/login/`, () =>
        HttpResponse.json(
          { code: "auth.account_locked", detail: "Locked.", status: 429, request_id: "req-1" },
          { status: 429, headers: { "Retry-After": "600", "X-Request-ID": "req-1", "Set-Cookie": "csrftoken=x" } },
        ),
      ),
    );

    const response = await POST(loginRequest({ email: "a@b.test", password: "pw" }));

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ code: "auth.account_locked", request_id: "req-1" });
    expect(response.headers.get("retry-after")).toBe("600");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it.each([
    ["a cross-site origin", { origin: "https://evil.example" }, 403],
    ["no origin", { origin: "" }, 403],
    ["a form body", { "content-type": "application/x-www-form-urlencoded" }, 415],
  ])("rejects %s without calling the API", async (_case, headers, status) => {
    const response = await POST(loginRequest({ email: "a@b.test", password: "pw" }, headers));

    expect(response.status).toBe(status);
  });

  it("answers 503 when the API is unreachable", async () => {
    server.use(http.post(`${TEST_API}/auth/login/`, () => HttpResponse.error()));

    const response = await POST(loginRequest({ email: "a@b.test", password: "pw" }));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "bff.api_unavailable" });
  });
});
