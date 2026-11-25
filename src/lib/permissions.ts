/** Permission codenames from fleetflow-api (`/me` permissions; seeded per module). Defined once (rules.md §11). */
export const PERMISSIONS = {
  usersView: "users.view",
  customersView: "customers.view",
  customersManage: "customers.manage",
} as const;
