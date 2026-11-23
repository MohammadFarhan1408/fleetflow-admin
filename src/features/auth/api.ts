import { postJson } from "@/lib/api/bff-client";

// BFF auth routes (src/app/bff/auth). Tokens never reach the browser; these calls only set or clear cookies.
const AUTH_ENDPOINTS = {
  login: "/bff/auth/login",
  logout: "/bff/auth/logout",
  passwordReset: "/bff/auth/password-reset",
  passwordResetConfirm: "/bff/auth/password-reset/confirm",
} as const;

export const login = (credentials: { email: string; password: string }) => postJson(AUTH_ENDPOINTS.login, credentials);

export const logout = () => postJson(AUTH_ENDPOINTS.logout, {});

export const requestPasswordReset = (email: string) => postJson(AUTH_ENDPOINTS.passwordReset, { email });

export const confirmPasswordReset = (body: { uid: string; token: string; new_password: string }) =>
  postJson(AUTH_ENDPOINTS.passwordResetConfirm, body);
