import { API_ERROR_CODES, ApiError, NetworkError } from "./errors";

export type MutationMessage = { title: string; detail: string };

/** User-safe copy for a failed write. Never shows the API's raw message (rules.md §4); adds the reference for support. */
export const describeMutationError = (error: unknown): MutationMessage => {
  const reference = error instanceof ApiError && error.requestId ? ` Reference: ${error.requestId}` : "";
  if (error instanceof NetworkError) {
    return { title: "Can't reach FleetFlow", detail: "Check your connection, then try again." };
  }
  if (error instanceof ApiError) {
    if (error.status === 403 || error.code === API_ERROR_CODES.permissionDenied) {
      return {
        title: "You don't have permission to do this",
        detail: `Ask your company administrator if you need it.${reference}`,
      };
    }
    if (error.status === 404) {
      return { title: "This no longer exists", detail: `It may have been removed.${reference}` };
    }
    if (error.status === 429 || error.code === API_ERROR_CODES.throttled) {
      const wait = error.retryAfterSeconds ? ` in ${error.retryAfterSeconds} seconds` : " in a moment";
      return { title: "Too many requests", detail: `Try again${wait}.` };
    }
  }
  return { title: "That didn't work", detail: `Try again. If it keeps happening, contact support.${reference}` };
};
