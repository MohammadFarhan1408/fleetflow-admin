import { useRouter } from "next/navigation";

import { useToast } from "@/components/shared/ToastProvider";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { ROUTES } from "@/lib/routes";

/**
 * Failures that end a customer or address write instead of being fixed in place: the customer or address was
 * archived meanwhile (409), the user lost the permission (403) or the record is gone (404). `close` leaves the form
 * or dialog, an error toast says why, and the mutation has already refetched. A missing record goes to
 * `missingHref` (the customer page for an address, whose own page then says if the customer is gone too).
 * Returns whether the error was handled.
 */
export const useCustomerWriteError = (close: () => void, missingHref: string = ROUTES.customers) => {
  const toast = useToast();
  const router = useRouter();

  return (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    const archivedRecord =
      error.code === API_ERROR_CODES.addressArchived
        ? "address"
        : error.code === API_ERROR_CODES.customerArchived
          ? "customer"
          : null;
    const missing = error.status === 404;
    const forbidden = error.status === 403 || error.code === API_ERROR_CODES.permissionDenied;
    if (!archivedRecord && !missing && !forbidden) return false;

    // A missing record has no page to stay on; every other failure just ends the current form or dialog.
    if (missing) router.push(missingHref);
    else close();
    if (archivedRecord) {
      toast({
        tone: "error",
        title: `This ${archivedRecord} was archived`,
        description: `Archived ${archivedRecord === "address" ? "addresses" : "customers"} can't be changed.`,
      });
    } else {
      const { title, detail } = describeMutationError(error);
      toast({ tone: "error", title, description: detail });
    }
    return true;
  };
};
