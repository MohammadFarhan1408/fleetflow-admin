"use client";

import { usePermissions } from "@/features/session/SessionContext";

/**
 * Hides `children` without the permission. UX only (architecture §10): the API enforces it again, so
 * every action behind a gate still handles a 403.
 */
export const PermissionGate = ({ permission, children }: { permission: string; children: React.ReactNode }) => {
  const { can } = usePermissions();
  return can(permission) ? children : null;
};
