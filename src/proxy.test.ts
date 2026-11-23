// @vitest-environment node
import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { fakeJwt, server, TEST_API } from "@/test/msw";
import { proxy } from "./proxy";

const page = (path: string, cookies: Record<string, string> = {}) =>
  new NextRequest(`http://admin.test${path}`, {
    headers: {
      cookie: Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; "),
    },
  });

describe("proxy", () => {
  it("lets requests with an access cookie through untouched", async () => {
    const response = await proxy(page("/users", { ff_access: "a", ff_refresh: "r" }));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects to login with the requested path when there is no session", async () => {
    const response = await proxy(page("/users?tab=roles"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://admin.test/login?next=%2Fusers%3Ftab%3Droles");
  });

  it("rotates an expired access token and passes the new cookies to the page and the browser", async () => {
    const tokens = { access: fakeJwt(900, "new-access"), refresh: fakeJwt(86_400, "new-refresh") };
    server.use(
      http.post(`${TEST_API}/auth/refresh/`, async ({ request }) => {
        expect(await request.json()).toEqual({ refresh: "old-refresh" });
        return HttpResponse.json(tokens);
      }),
    );

    const response = await proxy(page("/", { ff_refresh: "old-refresh" }));

    expect(response.headers.get("location")).toBeNull();
    expect(response.cookies.get("ff_access")).toMatchObject({ value: tokens.access, httpOnly: true, secure: true });
    expect(response.cookies.get("ff_refresh")?.value).toBe(tokens.refresh);
    // The page rendered by this request must see the new access token.
    expect(response.headers.get("x-middleware-request-cookie")).toContain(`ff_access=${tokens.access}`);
  });

  it("sends the user to login and clears cookies when the session has ended", async () => {
    server.use(
      http.post(`${TEST_API}/auth/refresh/`, () =>
        HttpResponse.json({ code: "auth.token_invalid", detail: "Session ended." }, { status: 401 }),
      ),
    );

    const response = await proxy(page("/users", { ff_refresh: "revoked" }));

    expect(response.headers.get("location")).toBe("http://admin.test/login?next=%2Fusers&notice=session_expired");
    expect(response.cookies.get("ff_refresh")?.value).toBe("");
  });

  it("keeps the session when the API is temporarily unavailable", async () => {
    server.use(http.post(`${TEST_API}/auth/refresh/`, () => new HttpResponse(null, { status: 503 })));

    const response = await proxy(page("/", { ff_refresh: "still-valid" }));

    expect(response.headers.get("location")).toBeNull();
    expect(response.cookies.get("ff_refresh")).toBeUndefined();
  });

  it("shares one refresh between concurrent requests with the same token", async () => {
    let calls = 0;
    server.use(
      http.post(`${TEST_API}/auth/refresh/`, () => {
        calls += 1;
        return HttpResponse.json({ access: fakeJwt(900), refresh: fakeJwt(86_400) });
      }),
    );

    await Promise.all([1, 2, 3].map(() => proxy(page("/", { ff_refresh: "shared" }))));

    expect(calls).toBe(1);
  });
});
