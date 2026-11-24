import type { User } from "@/features/users/api";

export const buildUser = (overrides: Partial<User> = {}): User => ({
  public_id: "01a2-0000-0000-0001",
  email: "dana@northwind.test",
  full_name: "Dana Dispatcher",
  is_active: true,
  roles: ["dispatcher"],
  branches: [{ public_id: "b-1", name: "Berlin Hub" }],
  last_login: null,
  created_at: "2026-11-01T09:00:00Z",
  ...overrides,
});
