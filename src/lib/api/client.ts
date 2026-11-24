import createClient from "openapi-fetch";

import type { paths } from "@/generated/api";
import { ApiError, NetworkError, type ApiErrorBody } from "./errors";

/**
 * Typed fleetflow-api client for the browser. Paths match the generated contract (`/api/v1/...`) and go
 * through the BFF proxy at `/bff/api/v1/...`, which adds the session token (architecture §8).
 * The absolute base URL lets the same client run in jsdom tests, where fetch rejects relative URLs.
 */
export const apiClient = createClient<paths>({ baseUrl: `${globalThis.location?.origin ?? ""}/bff` });

type FetchResult<Data> = { data?: Data; error?: unknown; response: Response };

/** Returns the response data, or throws ApiError for error statuses and NetworkError when unreachable. */
export const unwrap = async <Data>(request: Promise<FetchResult<Data>>): Promise<Data> => {
  let result: FetchResult<Data>;
  try {
    result = await request;
  } catch (error) {
    throw new NetworkError(error);
  }
  const { data, error, response } = result;
  if (!response.ok) {
    const body = error && typeof error === "object" ? (error as Partial<ApiErrorBody>) : null;
    throw new ApiError(response.status, body, response.headers.get("Retry-After"));
  }
  return data as Data;
};

/** The `cursor` from a fleetflow-api `next` / `previous` link, or null at either end of the list. */
export const cursorFrom = (link: string | null | undefined): string | null => {
  if (!link) return null;
  try {
    return new URL(link).searchParams.get("cursor");
  } catch {
    return null; // Not a URL: treat as no further page rather than guessing.
  }
};
