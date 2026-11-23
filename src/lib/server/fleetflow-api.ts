import "server-only";

import type { components } from "@/generated/api";
import { serverEnv } from "@/lib/env";

export type TokenPair = components["schemas"]["TokenPair"];

type ApiRequest = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string;
  /** The browser's IP, forwarded so the API throttles per user rather than per BFF server. */
  clientIp?: string | null;
};

/** Calls fleetflow-api from the server. `path` is relative to /api/v1/ and ends with a slash. */
export const callApi = (path: string, { method = "GET", body, accessToken, clientIp }: ApiRequest = {}) => {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (clientIp) headers.set("X-Forwarded-For", clientIp);

  return fetch(`${serverEnv.FLEETFLOW_API_URL}/api/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
};

/**
 * The client IP as reported by the hosting edge. Only trust this behind a proxy that overwrites the header
 * (hosting is NEEDS APPROVAL, architecture §23); fleetflow-api decides how many hops it trusts (NUM_PROXIES).
 */
export const clientIpFrom = (headers: Headers): string | null =>
  headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

/** Refresh succeeded, the session is over (log in again), or the API could not answer (keep the session). */
export type RefreshResult =
  { outcome: "refreshed"; tokens: TokenPair } | { outcome: "ended" } | { outcome: "unavailable" };

const inFlightRefreshes = new Map<string, Promise<RefreshResult>>();

/**
 * Rotates a refresh token. Concurrent callers with the same token share one request, because every
 * rotation invalidates the old token. ponytail: per server instance; the API's 30 s reuse grace covers
 * concurrent refreshes across instances.
 */
export const refreshTokens = (refreshToken: string, clientIp: string | null): Promise<RefreshResult> => {
  const pending = inFlightRefreshes.get(refreshToken);
  if (pending) return pending;

  const request = rotate(refreshToken, clientIp).finally(() => inFlightRefreshes.delete(refreshToken));
  inFlightRefreshes.set(refreshToken, request);
  return request;
};

const rotate = async (refreshToken: string, clientIp: string | null): Promise<RefreshResult> => {
  let response: Response;
  try {
    response = await callApi("auth/refresh/", { method: "POST", body: { refresh: refreshToken }, clientIp });
  } catch (error) {
    console.error("fleetflow-api token refresh failed", error);
    return { outcome: "unavailable" };
  }
  if (response.ok) return { outcome: "refreshed", tokens: (await response.json()) as TokenPair };
  // 429 and 5xx are temporary: keep the session and let the caller retry later.
  if (response.status === 429 || response.status >= 500) return { outcome: "unavailable" };
  return { outcome: "ended" };
};
