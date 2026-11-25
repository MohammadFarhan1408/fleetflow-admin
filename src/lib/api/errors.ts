import type { components } from "@/generated/api";

export type ApiErrorBody = components["schemas"]["Error"];

// Codes from fleetflow-api CHANGELOG.md. The schema types `code` as a plain string, so they live here once.
export const API_ERROR_CODES = {
  invalidCredentials: "auth.invalid_credentials",
  userDisabled: "auth.user_disabled",
  companySuspended: "auth.company_suspended",
  tokenExpired: "auth.token_expired",
  tokenInvalid: "auth.token_invalid",
  notAuthenticated: "auth.not_authenticated",
  accountLocked: "auth.account_locked",
  throttled: "throttled",
  invalidResetToken: "auth.invalid_reset_token",
  validationInvalid: "validation.invalid",
  permissionDenied: "permission.denied",
  notFound: "not_found",
  idempotencyKeyReuse: "idempotency.key_reuse",
  customerArchived: "customer.archived",
} as const;

// Codes the BFF itself returns (same envelope shape, never from fleetflow-api).
export const BFF_ERROR_CODES = {
  invalidOrigin: "bff.invalid_origin",
  unsupportedMediaType: "bff.unsupported_media_type",
  apiUnavailable: "bff.api_unavailable",
} as const;

/** An error response from fleetflow-api or the BFF, parsed from the shared envelope. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fieldErrors: Record<string, string[]>;
  readonly requestId: string | null;
  readonly retryAfterSeconds: number | null;

  constructor(status: number, body: Partial<ApiErrorBody> | null, retryAfter: string | null) {
    super(body?.detail ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? null;
    this.fieldErrors = toFieldErrors(body?.errors);
    this.requestId = body?.request_id ?? null;
    const seconds = Number(retryAfter);
    this.retryAfterSeconds = retryAfter !== null && Number.isFinite(seconds) ? seconds : null;
  }
}

const toFieldErrors = (errors: ApiErrorBody["errors"]): Record<string, string[]> => {
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ]),
  );
};

/** Reads an error response. A body that is not the error envelope (for example a gateway page) still yields an ApiError. */
export const readApiError = async (response: Response): Promise<ApiError> => {
  const body = await response.json().catch(() => null);
  const envelope = body && typeof body === "object" && "code" in body ? (body as Partial<ApiErrorBody>) : null;
  return new ApiError(response.status, envelope, response.headers.get("Retry-After"));
};

/** The request never got an HTTP answer (offline, DNS, connection reset). */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Network request failed", { cause });
    this.name = "NetworkError";
  }
}
