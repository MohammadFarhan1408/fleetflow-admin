"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { FormSkeleton } from "@/components/shared/FormSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatePanel } from "@/components/shared/StatePanel";
import { Button } from "@/components/ui/Button";
import { vehiclePath } from "@/lib/routes";
import { vehiclesQueries } from "../api";
import { VehicleDetailError } from "./VehicleDetailError";
import { VehicleForm } from "./VehicleForm";

/** The edit page's content: loads the vehicle, then shows the form (archived vehicles can't be changed). */
export const VehicleEdit = ({ publicId }: { publicId: string }) => {
  const query = useQuery(vehiclesQueries.detail(publicId));

  if (query.isPending) return <FormSkeleton />;
  if (query.isError) return <VehicleDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const vehicle = query.data;
  if (vehicle.archived_at) {
    return (
      <StatePanel>
        <EmptyState
          icon={ArchiveIcon}
          title="Archived vehicles can't be edited"
          description={`${vehicle.registration_number} was archived, so its details are kept as they were.`}
          action={
            <Button asChild variant="secondary">
              <Link href={vehiclePath(vehicle.public_id)}>Back to vehicle</Link>
            </Button>
          }
        />
      </StatePanel>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${vehicle.registration_number}`}
        description="Changes apply to new assignments. Routes already planned keep what they were checked against."
      />
      {/* Keyed by the saved version, so a refetched vehicle replaces the starting values. */}
      <VehicleForm key={vehicle.updated_at} vehicle={vehicle} />
    </div>
  );
};
