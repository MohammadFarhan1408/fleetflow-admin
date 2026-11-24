import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw";
import { apiClient, cursorFrom, unwrap } from "./client";
import { ApiError, NetworkError } from "./errors";

describe("unwrap", () => {
  it("returns data for a success", async () => {
    server.use(http.get("*/bff/api/v1/me/", () => HttpResponse.json({ roles: ["owner"] })));

    await expect(unwrap(apiClient.GET("/api/v1/me/"))).resolves.toMatchObject({ roles: ["owner"] });
  });

  it("throws ApiError with the envelope fields", async () => {
    server.use(
      http.get("*/bff/api/v1/me/", () =>
        HttpResponse.json(
          { code: "auth.token_invalid", detail: "Ended.", request_id: "r-7" },
          { status: 401, headers: { "Retry-After": "5" } },
        ),
      ),
    );

    const error = await unwrap(apiClient.GET("/api/v1/me/")).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "auth.token_invalid", requestId: "r-7", retryAfterSeconds: 5 });
  });

  it("throws NetworkError when the request never gets an answer", async () => {
    server.use(http.get("*/bff/api/v1/me/", () => HttpResponse.error()));

    await expect(unwrap(apiClient.GET("/api/v1/me/"))).rejects.toBeInstanceOf(NetworkError);
  });
});

describe("cursorFrom", () => {
  it.each([
    ["http://api.test/api/v1/users/?cursor=cD0xMjM%3D&page_size=25", "cD0xMjM="],
    [null, null],
    ["http://api.test/api/v1/users/", null],
    ["not a url", null],
  ])("%s → %s", (link, cursor) => expect(cursorFrom(link)).toBe(cursor));
});
