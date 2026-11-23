"use client";

import { createContext, useContext } from "react";

import type { components } from "@/generated/api";

export type Session = components["schemas"]["Me"];

const SessionContext = createContext<Session | null>(null);

/** Provides `/me` (read once on the server by the console layout) to client components. */
export const SessionProvider = ({ session, children }: { session: Session; children: React.ReactNode }) => (
  <SessionContext value={session}>{children}</SessionContext>
);

export const useSession = (): Session => {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside the console layout's SessionProvider");
  return session;
};

/** Permission check for UX only (architecture §10): the API enforces every permission again. */
export const usePermissions = () => {
  const { permissions } = useSession();
  return { can: (permission: string) => permissions.includes(permission) };
};
