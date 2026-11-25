export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  users: "/settings/users",
  customers: "/customers",
  customerNew: "/customers/new",
  vehicles: "/fleet/vehicles",
} as const;

export const userPath = (publicId: string) => `${ROUTES.users}/${encodeURIComponent(publicId)}`;
export const customerPath = (publicId: string) => `${ROUTES.customers}/${encodeURIComponent(publicId)}`;
export const vehiclePath = (publicId: string) => `${ROUTES.vehicles}/${encodeURIComponent(publicId)}`;
export const customerEditPath = (publicId: string) => `${customerPath(publicId)}/edit`;
export const addressNewPath = (customerId: string) => `${customerPath(customerId)}/addresses/new`;
export const addressEditPath = (customerId: string, addressId: string) =>
  `${customerPath(customerId)}/addresses/${encodeURIComponent(addressId)}/edit`;

/** Query values the login page understands (`?notice=`). */
export const LOGIN_NOTICES = { sessionExpired: "session_expired", passwordReset: "password_reset" } as const;
export type LoginNotice = (typeof LOGIN_NOTICES)[keyof typeof LOGIN_NOTICES];

const PLACEHOLDER_ORIGIN = "http://fleetflow.invalid";

/**
 * Returns `value` only when it is a same-origin relative path (rules.md §4: no open redirects),
 * otherwise `fallback`. Paths back into the login page are refused to avoid loops.
 */
export const safeNextPath = (value: string | null | undefined, fallback: string = ROUTES.home): string => {
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  try {
    const url = new URL(value, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN || url.pathname.startsWith(ROUTES.login)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback; // Unparseable input is not a path we redirect to.
  }
};

export const loginPath = ({ next, notice }: { next?: string; notice?: LoginNotice } = {}) => {
  const params = new URLSearchParams();
  const safeNext = safeNextPath(next, "");
  if (safeNext && safeNext !== ROUTES.home) params.set("next", safeNext);
  if (notice) params.set("notice", notice);
  const query = params.toString();
  return query ? `${ROUTES.login}?${query}` : ROUTES.login;
};
