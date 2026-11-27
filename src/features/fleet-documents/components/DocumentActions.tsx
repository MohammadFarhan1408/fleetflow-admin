"use client";

import { ArchiveIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import type { DocumentOwner, FleetDocument } from "../api";
import { documentName } from "../document-name";
import { startDownload } from "../download";
import { OWNER_SUBJECT } from "../labels";
import { useArchiveDocument, requestDownloadUrl } from "../mutations";
import { useDocumentWriteError } from "../use-document-write-error";

/**
 * Download and Archive for one document (`fleet.manage`). Archive asks first: the document stops counting for
 * availability, so the owner can become unassignable. Download works for an archived owner, Archive does not.
 */
export const DocumentActions = ({
  owner,
  ownerId,
  document,
  canArchive,
}: {
  owner: DocumentOwner;
  ownerId: string;
  document: FleetDocument;
  canArchive: boolean;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();
  const archive = useArchiveDocument(owner, ownerId);
  const key = useIdempotencyKey();
  const handleFatalError = useDocumentWriteError(owner, () => setConfirming(false));
  const name = documentName(document);

  const download = async () => {
    setDownloading(true);
    try {
      startDownload(await requestDownloadUrl(owner, ownerId, document.public_id));
    } catch (error) {
      const { title, detail } = describeMutationError(error);
      toast({ tone: "error", title: `Couldn't download ${name}`, description: `${title}. ${detail}` });
    } finally {
      setDownloading(false);
    }
  };

  const confirm = async () => {
    try {
      await archive.mutateAsync({ documentId: document.public_id, idempotencyKey: key.keyFor(document.public_id) });
      key.reset();
      setConfirming(false);
      toast({ tone: "success", title: `${name} archived` });
    } catch (error) {
      if (handleFatalError(error)) return;
      const { title, detail } = describeMutationError(error);
      setConfirming(false);
      toast({ tone: "error", title, description: detail });
    }
  };

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Download ${name}`}
        loading={downloading}
        onClick={() => void download()}
      >
        <DownloadIcon />
      </Button>
      {canArchive && (
        <>
          <Button variant="ghost" size="icon-sm" aria-label={`Archive ${name}`} onClick={() => setConfirming(true)}>
            <ArchiveIcon />
          </Button>
          <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title={`Archive ${name}?`}
            description={`It stops counting towards availability, so this ${OWNER_SUBJECT[owner]} may become unavailable.`}
            confirmLabel="Archive document"
            destructive
            loading={archive.isPending}
            onConfirm={() => void confirm()}
          />
        </>
      )}
    </div>
  );
};
