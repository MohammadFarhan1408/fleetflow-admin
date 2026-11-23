import { API_ERROR_CODES, ApiError, NetworkError } from "@/lib/api/errors";

export type FormAlert = { title: string; detail?: string; requestId?: string | null };

const waitText = (seconds: number | null) => {
  if (!seconds) return "Try again shortly.";
  const minutes = Math.ceil(seconds / 60);
  return seconds < 60
    ? `Try again in ${seconds} second${seconds === 1 ? "" : "s"}.`
    : `Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
};

/** User-safe text for an auth failure (rules.md §4: no raw API errors). */
export const authErrorAlert = (error: unknown): FormAlert => {
  if (error instanceof NetworkError) {
    return { title: "Can't reach FleetFlow", detail: "Check your connection and try again." };
  }
  if (!(error instanceof ApiError)) {
    return { title: "Something went wrong", detail: "Try again." };
  }
  switch (error.code) {
    case API_ERROR_CODES.invalidCredentials:
      return { title: "Email or password is incorrect" };
    case API_ERROR_CODES.userDisabled:
      return { title: "This account is disabled", detail: "Contact your company administrator." };
    case API_ERROR_CODES.companySuspended:
      return { title: "Your company's access is suspended", detail: "Contact your company administrator." };
    case API_ERROR_CODES.accountLocked:
      return { title: "Too many failed sign-in attempts", detail: waitText(error.retryAfterSeconds) };
    case API_ERROR_CODES.throttled:
      return { title: "Too many requests", detail: waitText(error.retryAfterSeconds) };
    case API_ERROR_CODES.invalidResetToken:
      return {
        title: "This link has expired or was already used",
        detail: "Request a new link to set your password.",
      };
    default:
      return {
        title: error.status >= 500 ? "FleetFlow is unavailable" : "Something went wrong",
        detail: "Try again. If it keeps happening, contact support with the reference below.",
        requestId: error.requestId,
      };
  }
};
