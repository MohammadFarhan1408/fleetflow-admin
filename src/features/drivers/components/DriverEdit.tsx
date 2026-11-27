"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { FormSkeleton } from "@/components/shared/FormSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatePanel } from "@/components/shared/StatePanel";
import { Button } from "@/components/ui/Button";
import { driverPath } from "@/lib/routes";
import { driversQueries } from "../api";
import { DriverDetailError } from "./DriverDetailError";
import { DriverForm } from "./DriverForm";

/** The edit page's content: loads the driver, then shows the form (archived drivers can't be changed). */
export const DriverEdit = ({ publicId }: { publicId: string }) => {
  const query = useQuery(driversQueries.detail(publicId, null));

  if (query.isPending) return <FormSkeleton />;
  if (query.isError) return <DriverDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const driver = query.data;
  if (driver.archived_at) {
    return (
      <StatePanel>
        <EmptyState
          icon={ArchiveIcon}
          title="Archived drivers can't be edited"
          description={`${driver.user.full_name} was archived, so their details are kept as they were.`}
          action={
            <Button asChild variant="secondary">
              <Link href={driverPath(driver.public_id)}>Back to driver</Link>
            </Button>
          }
        />
      </StatePanel>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${driver.user.full_name}`}
        description="Changes apply to new assignments. Routes already planned keep what they were checked against."
      />
      {/* Keyed by the saved version, so a refetched driver replaces the starting values. */}
      <DriverForm key={driver.updated_at} driver={driver} />
    </div>
  );
};
