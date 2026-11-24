// @vitest-environment node
import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { fakeJwt, server, TEST_API } from "@/test/msw";
import { GET, POST } from "./route";

const request = (
  path: string[],
  {
    method = "GET",
    cookies = "ff_access=good-access; ff_refresh=good-refresh",
    headers = {},
    body,
  }: {
    method?: string;
    cookies?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {},
) =>
  [
    new NextRequest(`http://admin.test/bff/api/v1/${path.join("/")}?page_size=25`, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        host: "admin.test",
        origin: "http://admin.test",
        "content-type": "application/json",
        cookie: cookies,
        ...headers,
      },
    }),
    { params: Promise.resolve({ path }) },
  ] as const;

const expired = () => HttpResponse.json({ code: "auth.token_expired", detail: "Expired." }, { status: 401 });

describe("BFF API proxy", () => {
  it("forwards to fleetflow-api with the access token, trailing slash and query", async () => {
    server.use(
      http.get(`${TEST_API}/users/`, ({ request: apiRequest }) => {
        expect(apiRequest.headers.get("authorization")).toBe("Bearer good-access");
        expect(new URL(apiRequest.url).searchParams.get("page_size")).toBe("25");
        expect(apiRequest.headers.get("cookie")).toBeNull();
        return HttpResponse.json({ next: null, previous: null, results: [] }, { headers: { "X-Request-ID": "r-1" } });
      }),
    );

    const response = await GET(...request(["users"]));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ next: null, previous: null, results: [] });
    expect(response.headers.get("x-request-id")).toBe("r-1");
  });

  it("refreshes once on auth.token_expired, retries, and sets the rotated cookies", async () => {
    const tokens = { access: fakeJwt(900, "fresh"), refresh: fakeJwt(86_400, "fresh-r") };
    server.use(
      http.get(`${TEST_API}/users/`, ({ request: apiRequest }) =>
        apiRequest.headers.get("authorization") === `Bearer ${tokens.access}`
          ? HttpResponse.json({ next: null, previous: null, results: [] })
          : expired(),
      ),
      http.post(`${TEST_API}/auth/refresh/`, () => HttpResponse.json(tokens)),
    );

    const response = await GET(...request(["users"], { cookies: "ff_access=stale; ff_refresh=refresh-1" }));

    expect(response.status).toBe(200);
    expect(response.cookies.get("ff_access")?.value).toBe(tokens.access);
    expect(response.cookies.get("ff_refresh")?.value).toBe(tokens.refresh);
  });

  it("refreshes first when only the refresh cookie is left", async () => {
    const tokens = { access: fakeJwt(900, "fresh2"), refresh: fakeJwt(86_400, "fresh2-r") };
    server.use(
      http.post(`${TEST_API}/auth/refresh/`, () => HttpResponse.json(tokens)),
      http.get(`${TEST_API}/users/`, ({ request: apiRequest }) => {
        expect(apiRequest.headers.get("authorization")).toBe(`Bearer ${tokens.access}`);
        return HttpResponse.json({ next: null, previous: null, results: [] });
      }),
    );

    const response = await GET(...request(["users"], { cookies: "ff_refresh=refresh-2" }));

    expect(response.status).toBe(200);
  });

  it("returns 401 and clears the cookies when the session has ended", async () => {
    server.use(
      http.get(`${TEST_API}/users/`, expired),
      http.post(`${TEST_API}/auth/refresh/`, () =>
        HttpResponse.json({ code: "auth.token_invalid", detail: "Ended." }, { status: 401 }),
      ),
    );

    const response = await GET(...request(["users"], { cookies: "ff_access=stale; ff_refresh=revoked-3" }));

    expect(response.status).toBe(401);
    expect(response.cookies.get("ff_refresh")?.value).toBe("");
  });

  it.each([[["auth", "refresh"]], [["users", ".."]], [["users%2F..%2Fauth"]]])(
    "refuses %j without calling the API",
    async (path) => {
      const response = await GET(...request(path));

      expect(response.status).toBe(404);
    },
  );

  it("rejects cross-origin mutations", async () => {
    const response = await POST(
      ...request(["users"], {
        method: "POST",
        body: { email: "a@b.test" },
        headers: { origin: "https://evil.example" },
      }),
    );

    expect(response.status).toBe(403);
  });

  it("forwards the JSON body and Idempotency-Key, and nothing else from the browser", async () => {
    server.use(
      http.post(`${TEST_API}/users/`, async ({ request: apiRequest }) => {
        expect(await apiRequest.json()).toEqual({ email: "new@b.test" });
        expect(apiRequest.headers.get("idempotency-key")).toBe("key-1");
        expect(apiRequest.headers.get("x-custom")).toBeNull();
        return HttpResponse.json({ public_id: "u-9" }, { status: 201 });
      }),
    );

    const response = await POST(
      ...request(["users"], {
        method: "POST",
        body: { email: "new@b.test" },
        headers: { "idempotency-key": "key-1", "x-custom": "nope" },
      }),
    );

    expect(response.status).toBe(201);
  });

  it("answers 503 when the API is unreachable", async () => {
    server.use(http.get(`${TEST_API}/users/`, () => HttpResponse.error()));

    const response = await GET(...request(["users"]));

    expect(response.status).toBe(503);
  });
});
