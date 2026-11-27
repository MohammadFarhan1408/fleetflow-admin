"use client";

import { useQuery } from "@tanstack/react-query";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { useId, useState } from "react";

import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/features/session/SessionContext";
import { browserToday } from "@/lib/calendar";
import { PERMISSIONS } from "@/lib/permissions";
import { documentsQueries, type DocumentOwner, type FleetDocument } from "../api";
import { REQUIRED_DOCUMENTS_NOTE } from "../labels";
import { AddDocumentDialog } from "./AddDocumentDialog";
import { DocumentActions } from "./DocumentActions";
import { documentColumns } from "./documents-columns";

/**
 * A driver's or vehicle's documents and where each stands (valid, expires soon, expired). They decide availability,
 * so the empty state says what the owner needs. It loads on its own: a failure here leaves the page usable.
 */
export const DocumentsSection = ({
  owner,
  ownerId,
  ownerName,
  archived,
}: {
  owner: DocumentOwner;
  ownerId: string;
  /** Names the owner in the dialog: "Dana Driver", "B AB 1234". */
  ownerName: string;
  archived: boolean;
}) => {
  const headingId = useId();
  const query = useQuery(documentsQueries.list(owner, ownerId));
  const [adding, setAdding] = useState(false);
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.fleetManage);
  // An archived owner takes no documents (API 409); and a user without `uploads.create` cannot send a file.
  const canAdd = canManage && can(PERMISSIONS.uploadsCreate) && !archived;
  const hasDocuments = (query.data?.documents.length ?? 0) > 0;
  const addButton = (
    <Button variant={hasDocuments ? "secondary" : "primary"} onClick={() => setAdding(true)}>
      <PlusIcon />
      Add document
    </Button>
  );
  const columns: Column<FleetDocument>[] = [
    ...documentColumns(owner, browserToday()),
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Actions",
            align: "end" as const,
            cell: (document: FleetDocument) => (
              <DocumentActions owner={owner} ownerId={ownerId} document={document} canArchive={!archived} />
            ),
          },
        ]
      : []),
  ];

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-h3 text-text">
          Documents
        </h2>
        {canAdd && hasDocuments && addButton}
      </div>
      <DataTable
        caption="Documents"
        columns={columns}
        rows={query.data?.documents}
        getRowId={(document) => document.public_id}
        loading={query.isPending}
        skeletonRows={2}
        error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
        empty={
          <EmptyState
            icon={FileTextIcon}
            title="No documents yet"
            description={REQUIRED_DOCUMENTS_NOTE[owner]}
            action={canAdd ? addButton : undefined}
          />
        }
        footer={
          query.data?.hasMore && (
            <p className="text-caption text-text-secondary">Showing the 100 most recently added documents.</p>
          )
        }
      />
      {canAdd && (
        <AddDocumentDialog
          owner={owner}
          ownerId={ownerId}
          ownerName={ownerName}
          open={adding}
          onOpenChange={setAdding}
        />
      )}
    </section>
  );
};
