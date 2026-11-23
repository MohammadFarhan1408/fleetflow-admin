import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { components } from "@/generated/api";
import { readApiError } from "@/lib/api/errors";
import { LOGIN_NOTICES, loginPath } from "@/lib/routes";
import { callApi, clientIpFrom } from "./fleetflow-api";
import { SESSION_COOKIES } from "./session-cookies";

export type Me = components["schemas"]["Me"];

/**
 * The signed-in user, company, branches and permissions (`GET /me/`), read once per request.
 * Redirects to login when the API rejects the session; any other failure throws to the error boundary.
 */
export const getMe = cache(async (): Promise<Me> => {
  const accessToken = (await cookies()).get(SESSION_COOKIES.access)?.value;
  if (!accessToken) redirect(loginPath({ notice: LOGIN_NOTICES.sessionExpired }));

  const response = await callApi("me/", { accessToken, clientIp: clientIpFrom(await headers()) });
  if (response.status === 401) redirect(loginPath({ notice: LOGIN_NOTICES.sessionExpired }));
  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as Me;
});
