import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_NOTICES, loginPath } from "@/lib/routes";
import { clientIpFrom, refreshTokens } from "@/lib/server/fleetflow-api";
import { clearSessionCookies, SESSION_COOKIES, setSessionCookies } from "@/lib/server/session-cookies";

/**
 * Console navigations (architecture §5, §9). UX only: fleetflow-api enforces auth on every call.
 * - No session cookie: redirect to login with `next`.
 * - Access cookie expired but refresh cookie present: rotate the tokens here, because Server Components
 *   cannot set cookies. The new access token is also written into this request so the page renders with it.
 */
export const proxy = async (request: NextRequest) => {
  if (request.cookies.has(SESSION_COOKIES.access)) return NextResponse.next();

  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const refreshToken = request.cookies.get(SESSION_COOKIES.refresh)?.value;
  if (!refreshToken) return NextResponse.redirect(new URL(loginPath({ next }), request.url));

  const result = await refreshTokens(refreshToken, clientIpFrom(request.headers));
  if (result.outcome === "ended") {
    const response = NextResponse.redirect(
      new URL(loginPath({ next, notice: LOGIN_NOTICES.sessionExpired }), request.url),
    );
    clearSessionCookies(response.cookies);
    return response;
  }
  // ponytail: API briefly unreachable. Render anyway; the page's own API call shows the error state.
  if (result.outcome === "unavailable") return NextResponse.next();

  request.cookies.set(SESSION_COOKIES.access, result.tokens.access);
  request.cookies.set(SESSION_COOKIES.refresh, result.tokens.refresh);
  const response = NextResponse.next({ request: { headers: request.headers } });
  setSessionCookies(response.cookies, result.tokens);
  return response;
};

export const config = {
  // Everything except framework assets, the BFF, public auth pages and dev-only pages.
  matcher: ["/((?!_next/|bff/|dev/|(?:login|forgot-password|reset-password|favicon\\.ico)(?:/|$)).*)"],
};
