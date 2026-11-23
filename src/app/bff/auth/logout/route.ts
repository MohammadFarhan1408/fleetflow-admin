import { NextResponse, type NextRequest } from "next/server";

import { rejectUnsafeMutation } from "@/lib/server/bff";
import { callApi, clientIpFrom } from "@/lib/server/fleetflow-api";
import { clearSessionCookies, SESSION_COOKIES } from "@/lib/server/session-cookies";

/** Ends this device's session at fleetflow-api and clears the cookies. Always 204: the browser is logged out either way. */
export const POST = async (request: NextRequest) => {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;

  const refresh = request.cookies.get(SESSION_COOKIES.refresh)?.value;
  if (refresh) {
    try {
      const response = await callApi("auth/logout/", {
        method: "POST",
        body: { refresh },
        clientIp: clientIpFrom(request.headers),
      });
      // 400/401 mean the session had already ended at the API.
      if (response.status >= 500) console.error(`fleetflow-api logout returned ${response.status}`);
    } catch (error) {
      // The cookies are cleared below, so the tokens leave the browser; they expire at the API on their own.
      console.error("fleetflow-api logout failed", error);
    }
  }

  const result = new NextResponse(null, { status: 204 });
  clearSessionCookies(result.cookies);
  return result;
};
