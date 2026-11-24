import "server-only";

import { getMe } from "@/lib/server/session";
import { ForbiddenState } from "./forbidden-state";

/**
 * Page-level guard: renders the 403 state instead of `children` without the permission. UX only; the
 * API rejects the data calls anyway (architecture §10). Reads `/me`, so place it inside `<Suspense>`.
 */
export const RequirePermission = async ({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) => {
  const { permissions } = await getMe();
  return permissions.includes(permission) ? children : <ForbiddenState />;
};
