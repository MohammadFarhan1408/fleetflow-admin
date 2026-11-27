"use client";

import { useQuery } from "@tanstack/react-query";
import { TruckIcon } from "lucide-react";

import { AvailabilityPanel } from "@/components/shared/AvailabilityPanel";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Fact } from "@/components/shared/Fact";
import { FactList } from "@/components/shared/FactList";
import { IdentityTile } from "@/components/shared/IdentityTile";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { RecordMeta } from "@/components/shared/RecordMeta";
import { StatTile } from "@/components/shared/StatTile";
import { Card, CardTitle } from "@/components/ui/Card";
import { PERMISSIONS } from "@/lib/permissions";
import { vehiclesQueries } from "../api";
import { formatCapacity } from "../format";
import { UNAVAILABLE_REASON_LABELS } from "../labels";
import { VehicleActions } from "./VehicleActions";
import { VehicleDetailError } from "./VehicleDetailError";
import { VehicleDetailSkeleton } from "./VehicleDetailSkeleton";
import { VehicleStatus } from "./VehicleStatus";

/** One vehicle: can it be assigned today, what it carries, and where it is based. */
export const VehicleDetail = ({ publicId }: { publicId: string }) => {
  const query = useQuery(vehiclesQueries.detail(publicId));

  if (query.isPending) return <VehicleDetailSkeleton />;
  if (query.isError) return <VehicleDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const vehicle = query.data;
  const weight = formatCapacity.weight(vehicle.capacity_weight_kg);
  const volume = formatCapacity.volume(vehicle.capacity_volume_m3);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        leading={
          <IdentityTile>
            <TruckIcon />
          </IdentityTile>
        }
        title={<span className="font-mono">{vehicle.registration_number}</span>}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <VehicleStatus vehicle={vehicle} />
            <span>{[vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.branch.name}</span>
          </span>
        }
        actions={
          <PermissionGate permission={PERMISSIONS.fleetManage}>
            <VehicleActions vehicle={vehicle} />
          </PermissionGate>
        }
      />
      <AvailabilityPanel
        subject="vehicle"
        availability={vehicle.availability}
        labels={UNAVAILABLE_REASON_LABELS}
        statusReason={vehicle.status_reason}
      />
      <Card className="gap-5">
        <CardTitle>Specification</CardTitle>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:gap-8">
          <div className="grid grid-cols-2 gap-6 xl:border-r xl:border-border xl:pr-8">
            <StatTile label="Carries up to" value={weight.value} unit={weight.unit} />
            <StatTile label="Volume" value={volume.value} unit={volume.unit} />
          </div>
          <FactList columns={2}>
            <Fact label="Make">{vehicle.make || <EmptyValue />}</Fact>
            <Fact label="Model">{vehicle.model || <EmptyValue />}</Fact>
            <Fact label="Branch">
              {vehicle.branch.name} <span className="font-mono text-text-secondary">{vehicle.branch.code}</span>
            </Fact>
            <Fact label="Required licence category">{vehicle.required_license_category}</Fact>
          </FactList>
        </div>
      </Card>
      <RecordMeta createdAt={vehicle.created_at} updatedAt={vehicle.updated_at} archivedAt={vehicle.archived_at} />
    </div>
  );
};
