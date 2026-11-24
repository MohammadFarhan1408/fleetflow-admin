import { NextResponse, type NextRequest } from "next/server";

import { API_ERROR_CODES, type ApiErrorBody } from "@/lib/api/errors";
import { apiUnavailable, bffError, rejectUnsafeMutation, relayApiResponse } from "@/lib/server/bff";
import { callApi, clientIpFrom, refreshTokens, type ApiMethod, type TokenPair } from "@/lib/server/fleetflow-api";
import { clearSessionCookies, SESSION_COOKIES, setSessionCookies } from "@/lib/server/session-cookies";

// Path segments the API uses: resource names and UUIDs. Anything else ("..", encoded slashes) is refused.
const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;
// Token endpoints never pass through here: they would hand tokens to the browser (architecture §9).
const BLOCKED_FIRST_SEGMENTS = new Set(["auth"]);
const FORWARDED_REQUEST_HEADERS = ["idempotency-key"];

const isTokenExpired = async (response: Response) => {
  if (response.status !== 401) return false;
  const body = (await response
    .clone()
    .json()
    .catch(() => null)) as Partial<ApiErrorBody> | null;
  return body?.code === API_ERROR_CODES.tokenExpired;
};

/**
 * Authenticated proxy from the browser to fleetflow-api (architecture §8): `/bff/api/v1/<path>` →
 * `FLEETFLOW_API_URL/api/v1/<path>/` with the access token from the httpOnly cookie. On `auth.token_expired`
 * it refreshes once (shared with proxy.ts), retries, and sets the rotated cookies on the response.
 */
const proxyToApi = async (request: NextRequest, { params }: RouteContext<"/bff/api/v1/[...path]">) => {
  const { path } = await params;
  if (!path.every((segment) => SAFE_SEGMENT.test(segment)) || BLOCKED_FIRST_SEGMENTS.has(path[0] ?? "")) {
    return bffError(404, "not_found", "Not found", "This endpoint is not available.");
  }

  const method = request.method as ApiMethod;
  let body: unknown;
  if (method !== "GET") {
    const rejected = rejectUnsafeMutation(request);
    if (rejected) return rejected;
    body = await request.json().catch(() => undefined);
  }

  const apiPath = `${path.join("/")}/${request.nextUrl.search}`;
  const clientIp = clientIpFrom(request.headers);
  const headers = Object.fromEntries(
    FORWARDED_REQUEST_HEADERS.flatMap((name) => {
      const value = request.headers.get(name);
      return value ? [[name, value]] : [];
    }),
  );
  const call = (accessToken?: string) => callApi(apiPath, { method, body, headers, accessToken, clientIp });

  let accessToken = request.cookies.get(SESSION_COOKIES.access)?.value;
  const refreshToken = request.cookies.get(SESSION_COOKIES.refresh)?.value;
  let rotated: TokenPair | null = null;
  let sessionEnded = false;

  const refresh = async () => {
    if (!refreshToken) return false;
    const result = await refreshTokens(refreshToken, clientIp);
    if (result.outcome === "refreshed") {
      rotated = result.tokens;
      accessToken = result.tokens.access;
      return true;
    }
    sessionEnded = result.outcome === "ended";
    return false;
  };

  let response: Response;
  try {
    if (!accessToken) await refresh();
    response = await call(accessToken);
    if (!rotated && (await isTokenExpired(response)) && (await refresh())) response = await call(accessToken);
  } catch (error) {
    console.error(`fleetflow-api ${method} ${path[0]} failed`, error);
    return apiUnavailable();
  }

  const result: NextResponse = await relayApiResponse(response);
  if (rotated) setSessionCookies(result.cookies, rotated);
  if (sessionEnded) clearSessionCookies(result.cookies);
  return result;
};

export { proxyToApi as DELETE, proxyToApi as GET, proxyToApi as PATCH, proxyToApi as POST, proxyToApi as PUT };
