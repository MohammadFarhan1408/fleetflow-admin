"use client";

import { useQuery } from "@tanstack/react-query";

import { DetailRow } from "@/components/shared/DetailRow";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import { vehiclesQueries } from "../api";
import { formatVolumeM3, formatWeightKg } from "../format";
import { VehicleAvailability } from "./VehicleAvailability";
import { VehicleDetailError } from "./VehicleDetailError";
import { VehicleDetailSkeleton } from "./VehicleDetailSkeleton";
import { VehicleStatus } from "./VehicleStatus";

/** One vehicle: identity, status and availability, capacity and record. Read-only until vehicle management lands. */
export const VehicleDetail = ({ publicId }: { publicId: string }) => {
  const query = useQuery(vehiclesQueries.detail(publicId));

  if (query.isPending) return <VehicleDetailSkeleton />;
  if (query.isError) return <VehicleDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const vehicle = query.data;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={<span className="font-mono">{vehicle.registration_number}</span>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <VehicleStatus vehicle={vehicle} />
            {[vehicle.make, vehicle.model].filter(Boolean).join(" ")}
          </span>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Vehicle</CardTitle>
              <CardDescription>What it is and where it is based.</CardDescription>
            </div>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Make">{vehicle.make || <EmptyValue />}</DetailRow>
            <DetailRow label="Model">{vehicle.model || <EmptyValue />}</DetailRow>
            <DetailRow label="Branch">
              {vehicle.branch.name} <span className="font-mono text-text-secondary">{vehicle.branch.code}</span>
            </DetailRow>
            <DetailRow label="Required licence category">{vehicle.required_license_category}</DetailRow>
          </dl>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Status">
              <VehicleStatus vehicle={vehicle} />
            </DetailRow>
            {vehicle.status_reason && <DetailRow label="Reason">{vehicle.status_reason}</DetailRow>}
            <DetailRow label="Availability today">
              <VehicleAvailability vehicle={vehicle} />
            </DetailRow>
          </dl>
        </Card>
        <Card className="xl:col-span-8">
          <CardHeader>
            <CardTitle>Capacity</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Weight">
              <span className="tabular-nums">{formatWeightKg(vehicle.capacity_weight_kg)}</span>
            </DetailRow>
            <DetailRow label="Volume">
              <span className="tabular-nums">{formatVolumeM3(vehicle.capacity_volume_m3)}</span>
            </DetailRow>
          </dl>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Added">{formatDate(vehicle.created_at)}</DetailRow>
            <DetailRow label="Last updated">{formatDate(vehicle.updated_at)}</DetailRow>
            {vehicle.archived_at && <DetailRow label="Archived">{formatDate(vehicle.archived_at)}</DetailRow>}
          </dl>
        </Card>
      </div>
    </div>
  );
};
