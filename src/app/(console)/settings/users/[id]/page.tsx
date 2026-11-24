import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/require-permission";
import { UserDetail, UserDetailSkeleton } from "@/features/users/components/user-detail";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "User · FleetFlow Admin" };

const UserFromParams = async ({ params }: { params: PageProps<"/settings/users/[id]">["params"] }) => {
  const { id } = await params;
  return <UserDetail publicId={id} />;
};

const UserPage = ({ params }: PageProps<"/settings/users/[id]">) => (
  <Suspense fallback={<UserDetailSkeleton />}>
    <RequirePermission permission={PERMISSIONS.usersView}>
      <UserFromParams params={params} />
    </RequirePermission>
  </Suspense>
);

export default UserPage;
