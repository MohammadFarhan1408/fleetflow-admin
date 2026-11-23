import { NextResponse, type NextRequest } from "next/server";

import { apiUnavailable, readFields, rejectUnsafeMutation, relayApiResponse } from "@/lib/server/bff";
import { callApi, clientIpFrom, type TokenPair } from "@/lib/server/fleetflow-api";
import { setSessionCookies } from "@/lib/server/session-cookies";

/** Logs in through fleetflow-api and keeps the token pair in httpOnly cookies. The browser gets 204, never the tokens. */
export const POST = async (request: NextRequest) => {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;

  const body = await readFields(request, ["email", "password"]);
  let response: Response;
  try {
    response = await callApi("auth/login/", { method: "POST", body, clientIp: clientIpFrom(request.headers) });
  } catch (error) {
    console.error("fleetflow-api login failed", error);
    return apiUnavailable();
  }
  if (!response.ok) return relayApiResponse(response);

  const result = new NextResponse(null, { status: 204 });
  setSessionCookies(result.cookies, (await response.json()) as TokenPair);
  return result;
};
