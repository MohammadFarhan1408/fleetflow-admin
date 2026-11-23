import "server-only";

import type { NextResponse } from "next/server";
import type { TokenPair } from "./fleetflow-api";

// architecture §9: tokens live only in httpOnly cookies set by the BFF.
export const SESSION_COOKIES = { access: "ff_access", refresh: "ff_refresh" } as const;

type CookieJar = NextResponse["cookies"];

/** Seconds until the JWT's `exp`. Used only to expire the cookie with the token; the API verifies the token. */
export const secondsUntilExpiry = (jwt: string, now = Date.now()): number => {
  const payload = jwt.split(".")[1];
  if (!payload) return 0;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof exp === "number" ? Math.max(0, Math.floor(exp - now / 1000)) : 0;
  } catch (error) {
    console.error("Unreadable JWT payload", error instanceof Error ? error.message : error);
    return 0;
  }
};

export const setSessionCookies = (cookies: CookieJar, tokens: TokenPair) => {
  for (const [name, token] of [
    [SESSION_COOKIES.access, tokens.access],
    [SESSION_COOKIES.refresh, tokens.refresh],
  ] as const) {
    cookies.set(name, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: secondsUntilExpiry(token),
    });
  }
};

export const clearSessionCookies = (cookies: CookieJar) => {
  cookies.delete(SESSION_COOKIES.access);
  cookies.delete(SESSION_COOKIES.refresh);
};
