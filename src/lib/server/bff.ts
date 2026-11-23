import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { BFF_ERROR_CODES, type ApiErrorBody } from "@/lib/api/errors";
import { callApi, clientIpFrom } from "./fleetflow-api";

/** Headers from fleetflow-api that the browser may see. Everything else stays on the server. */
const RELAYED_RESPONSE_HEADERS = ["content-type", "retry-after", "x-request-id", "idempotent-replayed"];

export const bffError = (status: number, code: string, title: string, detail: string) =>
  NextResponse.json<ApiErrorBody>({ type: "bff_error", title, status, code, detail, request_id: null }, { status });

/**
 * CSRF defence for BFF mutations (architecture §9): SameSite=Lax cookies, plus a same-origin `Origin`
 * header and a JSON body, which a cross-site form cannot send.
 */
export const rejectUnsafeMutation = (request: NextRequest): NextResponse | null => {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost: string | null = null;
  try {
    originHost = origin ? new URL(origin).host : null;
  } catch {
    originHost = null; // A malformed Origin is treated like a missing one: rejected below.
  }
  if (!originHost || originHost !== host) {
    return bffError(403, BFF_ERROR_CODES.invalidOrigin, "Forbidden", "Cross-origin requests are not allowed.");
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return bffError(415, BFF_ERROR_CODES.unsupportedMediaType, "Unsupported media type", "Send a JSON body.");
  }
  return null;
};

export const apiUnavailable = () =>
  bffError(503, BFF_ERROR_CODES.apiUnavailable, "Service unavailable", "FleetFlow is unreachable. Try again shortly.");

/** Passes an API response (status, body and allow-listed headers) through to the browser. */
export const relayApiResponse = async (response: Response) => {
  const headers = new Headers();
  for (const name of RELAYED_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body = response.status === 204 ? null : await response.arrayBuffer();
  return new NextResponse(body, { status: response.status, headers });
};

/** Reads the JSON body and keeps only the named string fields, so the browser cannot add fields the BFF did not mean to send. */
export const readFields = async <Field extends string>(
  request: NextRequest,
  fields: readonly Field[],
): Promise<Record<Field, string>> => {
  const body: unknown = await request.json().catch(() => ({}));
  const source = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return Object.fromEntries(
    fields.map((field) => [field, typeof source[field] === "string" ? source[field] : ""]),
  ) as Record<Field, string>;
};

/** Forwards selected JSON fields to an unauthenticated fleetflow-api endpoint and relays the answer. */
export const forwardPublicPost = async <Field extends string>(
  request: NextRequest,
  apiPath: string,
  fields: readonly Field[],
) => {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;

  const body = await readFields(request, fields);
  try {
    const response = await callApi(apiPath, { method: "POST", body, clientIp: clientIpFrom(request.headers) });
    return relayApiResponse(response);
  } catch (error) {
    console.error(`fleetflow-api POST ${apiPath} failed`, error);
    return apiUnavailable();
  }
};
