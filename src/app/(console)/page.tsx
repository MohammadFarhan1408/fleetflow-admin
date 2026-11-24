import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2Icon, KeyRoundIcon, MapPinIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { humanizeCode } from "@/lib/format";
import { getMe } from "@/lib/server/session";

export const metadata: Metadata = { title: "Home · FleetFlow Admin" };

const Fact = ({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) => (
  <li className="flex gap-3 py-4 first:pt-0 last:pb-0 xl:px-5 xl:py-0 xl:first:pl-0 xl:last:pr-0">
    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary">
      <Icon aria-hidden className="size-5" />
    </span>
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-caption text-muted">{label}</p>
      <div className="text-body-strong text-text">{children}</div>
    </div>
  </li>
);

const BadgeList = ({ items, tone }: { items: string[]; tone: "info" | "primary" }) => (
  <ul className="flex flex-wrap gap-1">
    {items.map((item) => (
      <li key={item}>
        <Badge tone={tone} dot={false}>
          {item}
        </Badge>
      </li>
    ))}
  </ul>
);

const FACTS = [
  { key: "company", icon: Building2Icon, label: "Company" },
  { key: "branches", icon: MapPinIcon, label: "Branches" },
  { key: "roles", icon: ShieldCheckIcon, label: "Roles" },
  { key: "permissions", icon: KeyRoundIcon, label: "Permissions" },
] as const;

const factsGridClasses = "grid divide-y divide-border xl:grid-cols-4 xl:divide-x xl:divide-y-0";

const Welcome = async () => {
  const { user, company, roles } = await getMe();
  const firstName = user.full_name.trim().split(/\s+/)[0] || user.email;
  const roleLabels = roles.map(humanizeCode);
  return (
    <PageHeader
      title={`Welcome back, ${firstName}`}
      description={`You're signed in to ${company.name}${roleLabels[0] ? ` as ${roleLabels.join(", ")}` : ""}.`}
    />
  );
};

const WelcomeSkeleton = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="h-8 w-72" />
    <Skeleton className="h-4 w-96 max-w-full" />
  </div>
);

const WorkspaceFacts = async () => {
  const { company, branches, roles, permissions } = await getMe();
  const roleLabels = roles.map(humanizeCode);
  const values: Record<(typeof FACTS)[number]["key"], React.ReactNode> = {
    company: company.name,
    branches: branches.length === 0 ? "All branches" : <BadgeList items={branches.map((b) => b.name)} tone="info" />,
    roles: roleLabels.length === 0 ? "No role yet" : <BadgeList items={roleLabels} tone="primary" />,
    permissions: permissions.length === 1 ? "1 permission" : `${permissions.length} permissions`,
  };
  return (
    <ul className={factsGridClasses}>
      {FACTS.map(({ key, icon, label }) => (
        <Fact key={key} icon={icon} label={label}>
          {values[key]}
        </Fact>
      ))}
    </ul>
  );
};

const WorkspaceFactsSkeleton = () => (
  <ul className={factsGridClasses} aria-busy="true">
    {FACTS.map(({ key, icon, label }) => (
      <Fact key={key} icon={icon} label={label}>
        <Skeleton className="mt-1 h-4 w-28" />
      </Fact>
    ))}
  </ul>
);

// Home shows only what the API already provides (`/me`). Operational KPIs arrive with the Phase 7 dashboard.
const HomePage = () => (
  <div className="flex flex-col gap-6">
    <Suspense fallback={<WelcomeSkeleton />}>
      <Welcome />
    </Suspense>

    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Your workspace</CardTitle>
          <CardDescription>What your account can reach. Your company administrator manages it.</CardDescription>
        </div>
      </CardHeader>
      <Suspense fallback={<WorkspaceFactsSkeleton />}>
        <WorkspaceFacts />
      </Suspense>
    </Card>
  </div>
);

export default HomePage;
