"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { AvailabilityPanel } from "@/components/shared/AvailabilityPanel";
import { readDate } from "@/components/shared/availability-filter";
import { Fact } from "@/components/shared/Fact";
import { FactList } from "@/components/shared/FactList";
import { IdentityTile } from "@/components/shared/IdentityTile";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { RecordMeta } from "@/components/shared/RecordMeta";
import { Card, CardTitle } from "@/components/ui/Card";
import { initialsOf } from "@/lib/format";
import { PERMISSIONS } from "@/lib/permissions";
import { DocumentsSection } from "@/features/fleet-documents/components/DocumentsSection";
import { driversQueries } from "../api";
import { UNAVAILABLE_REASON_LABELS } from "../labels";
import { AvailabilityDateInput } from "./AvailabilityDateInput";
import { DriverActions } from "./DriverActions";
import { DriverDetailError } from "./DriverDetailError";
import { DriverDetailSkeleton } from "./DriverDetailSkeleton";
import { DriverLeave } from "./DriverLeave";
import { DriverStatus } from "./DriverStatus";

const contactLink = "text-primary hover:underline";

/** One driver: can they be assigned (on any day), their leave, and how to reach them. */
export const DriverDetail = ({ publicId }: { publicId: string }) => {
  const date = readDate(useSearchParams());
  const query = useQuery(driversQueries.detail(publicId, date));

  if (query.isPending) return <DriverDetailSkeleton />;
  if (query.isError) return <DriverDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const driver = query.data;
  const { full_name: name, email } = driver.user;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        leading={<IdentityTile>{initialsOf(name, email)}</IdentityTile>}
        title={name}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <DriverStatus driver={driver} />
            <span>
              {driver.branch.name} <span className="font-mono text-text-secondary">{driver.branch.code}</span>
            </span>
          </span>
        }
        actions={
          <PermissionGate permission={PERMISSIONS.fleetManage}>
            <DriverActions driver={driver} />
          </PermissionGate>
        }
      />
      <AvailabilityPanel
        subject="driver"
        availability={driver.availability}
        labels={UNAVAILABLE_REASON_LABELS}
        statusReason={driver.status_reason}
        action={
          <div className="flex items-center gap-2">
            <span className="text-caption text-text-secondary">Check another day</span>
            <AvailabilityDateInput value={date ?? driver.availability.date} />
          </div>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 xl:order-1 xl:col-span-8">
          <DocumentsSection
            owner="drivers"
            ownerId={publicId}
            ownerName={name}
            archived={Boolean(driver.archived_at)}
          />
          <DriverLeave driverId={publicId} driverName={name} archived={Boolean(driver.archived_at)} />
        </div>
        <Card className="xl:order-2 xl:col-span-4">
          <CardTitle>Details</CardTitle>
          <FactList>
            <Fact label="Phone">
              <a href={`tel:${driver.phone}`} className={`${contactLink} tabular-nums`}>
                {driver.phone}
              </a>
            </Fact>
            <Fact label="Email">
              <a href={`mailto:${encodeURIComponent(email)}`} className={contactLink}>
                {email}
              </a>
            </Fact>
          </FactList>
        </Card>
      </div>
      <RecordMeta createdAt={driver.created_at} updatedAt={driver.updated_at} archivedAt={driver.archived_at} />
    </div>
  );
};
