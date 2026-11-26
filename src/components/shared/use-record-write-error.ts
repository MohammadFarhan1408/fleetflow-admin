import { useRouter } from "next/navigation";

import { useToast } from "@/components/shared/ToastProvider";
import { ApiError } from "@/lib/api/errors";
import { describeMutationError } from "@/lib/api/mutation-errors";

/** API error code → how to name the archived record in the toast. */
export type ArchivedRecords = Record<string, { singular: string; plural: string }>;

/**
 * Failures that end a write instead of being fixed in place: the record was archived meanwhile (409, one of
 * `archivedRecords`), the user lost the permission (403) or the record is gone (404). `close` leaves the form or
 * dialog, an error toast says why, and the mutation has already refetched. A missing record goes to `missingHref`.
 * Returns whether the error was handled.
 */
export const useRecordWriteError = (close: () => void, missingHref: string, archivedRecords: ArchivedRecords) => {
  const toast = useToast();
  const router = useRouter();

  return (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    const archived = error.code ? archivedRecords[error.code] : undefined;
    const missing = error.status === 404;
    const forbidden = error.status === 403 || error.code === "permission.denied";
    if (!archived && !missing && !forbidden) return false;

    // A missing record has no page to stay on; every other failure just ends the current form or dialog.
    if (missing) router.push(missingHref);
    else close();
    if (archived) {
      toast({
        tone: "error",
        title: `This ${archived.singular} was archived`,
        description: `Archived ${archived.plural} can't be changed.`,
      });
    } else {
      const { title, detail } = describeMutationError(error);
      toast({ tone: "error", title, description: detail });
    }
    return true;
  };
};
