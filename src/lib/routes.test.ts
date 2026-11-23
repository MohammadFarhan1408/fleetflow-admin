import { describe, expect, it } from "vitest";

import { loginPath, safeNextPath } from "./routes";

describe("safeNextPath", () => {
  it.each([
    ["/users", "/users"],
    ["/users/abc?tab=roles#top", "/users/abc?tab=roles#top"],
    ["/a/../users", "/users"],
  ])("keeps the same-origin path %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "users",
    "https://evil.example/",
    "//evil.example/path",
    "/\\evil.example",
    "javascript:alert(1)",
    "/login?next=/users",
  ])("falls back for %s", (input) => {
    expect(safeNextPath(input, "/fallback")).toBe("/fallback");
  });
});

describe("loginPath", () => {
  it("adds a safe next path and a notice", () => {
    expect(loginPath({ next: "/users?x=1", notice: "session_expired" })).toBe(
      "/login?next=%2Fusers%3Fx%3D1&notice=session_expired",
    );
  });

  it("drops unsafe or home next paths", () => {
    expect(loginPath({ next: "//evil.example" })).toBe("/login");
    expect(loginPath({ next: "/" })).toBe("/login");
  });
});
