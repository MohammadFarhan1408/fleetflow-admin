import type { Session } from "@/features/session/SessionContext";

/** A `/me` response for component tests; override fields per test. */
export const buildSession = (overrides: Partial<Session> = {}): Session => ({
  user: { public_id: "u-1", email: "olivia@example.test", full_name: "Olivia Owner" },
  company: { public_id: "c-1", name: "Northwind Freight" },
  branches: [],
  roles: ["owner"],
  permissions: ["users.view", "users.manage"],
  ...overrides,
});
