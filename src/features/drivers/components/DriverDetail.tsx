"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { readDate } from "@/components/shared/availability-filter";
import { AvailabilityText } from "@/components/shared/AvailabilityText";
import { DetailRow } from "@/components/shared/DetailRow";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCalendarDate, formatDate } from "@/lib/format";
import { driversQueries } from "../api";
import { UNAVAILABLE_REASON_LABELS } from "../labels";

import { AvailabilityDateInput } from "./AvailabilityDateInput";
import { DriverDetailError } from "./DriverDetailError";
import { DriverDetailSkeleton } from "./DriverDetailSkeleton";
import { DriverLeave } from "./DriverLeave";
import { DriverStatus } from "./DriverStatus";

/** One driver: identity, status and availability on a chosen day, leave and record. Read-only until PR 5. */
export const DriverDetail = ({ publicId }: { publicId: string }) => {
  const date = readDate(useSearchParams());
  const query = useQuery(driversQueries.detail(publicId, date));

  if (query.isPending) return <DriverDetailSkeleton />;
  if (query.isError) return <DriverDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const driver = query.data;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={driver.user.full_name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <DriverStatus driver={driver} />
            {driver.user.email}
          </span>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Driver</CardTitle>
              <CardDescription>Who they are and where they are based.</CardDescription>
            </div>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Name">{driver.user.full_name}</DetailRow>
            <DetailRow label="Email">{driver.user.email}</DetailRow>
            <DetailRow label="Phone">
              <span className="tabular-nums">{driver.phone}</span>
            </DetailRow>
            <DetailRow label="Branch">
              {driver.branch.name} <span className="font-mono text-text-secondary">{driver.branch.code}</span>
            </DetailRow>
          </dl>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Status">
              <DriverStatus driver={driver} />
            </DetailRow>
            {driver.status_reason && <DetailRow label="Reason">{driver.status_reason}</DetailRow>}
            <DetailRow label={`Availability on ${formatCalendarDate(driver.availability.date)}`}>
              <AvailabilityText availability={driver.availability} labels={UNAVAILABLE_REASON_LABELS} />
            </DetailRow>
          </dl>
          <AvailabilityDateInput value={date ?? driver.availability.date} />
        </Card>
        <DriverLeave driverId={publicId} />
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Added">{formatDate(driver.created_at)}</DetailRow>
            <DetailRow label="Last updated">{formatDate(driver.updated_at)}</DetailRow>
            {driver.archived_at && <DetailRow label="Archived">{formatDate(driver.archived_at)}</DetailRow>}
          </dl>
        </Card>
      </div>
    </div>
  );
};
