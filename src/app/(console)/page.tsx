import type { Metadata } from "next";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getMe } from "@/lib/server/session";

export const metadata: Metadata = { title: "FleetFlow Admin" };

// ponytail: landing until the Phase 1 PR 2 shell, which sends users to their first permitted module.
const HomePage = async () => {
  const { user, company } = await getMe();
  return (
    <main className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-display">Signed in as {user.full_name || user.email}</h1>
        <p className="text-body text-text-secondary">{company.name}</p>
      </div>
      <SignOutButton />
    </main>
  );
};

export default HomePage;
