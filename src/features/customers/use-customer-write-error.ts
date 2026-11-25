import { useRouter } from "next/navigation";

import { useToast } from "@/components/shared/ToastProvider";
import { API_ERROR_CODES, ApiError } from "@/lib/api/errors";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { ROUTES } from "@/lib/routes";

/**
 * Failures that end a customer write instead of being fixed in place: the customer was archived meanwhile
 * (409), the user lost the permission (403) or the customer is gone (404). `close` leaves the form or dialog, an
 * error toast says why, and the mutation has already refetched. Returns whether the error was handled.
 */
export const useCustomerWriteError = (close: () => void) => {
  const toast = useToast();
  const router = useRouter();

  return (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    const archived = error.code === API_ERROR_CODES.customerArchived;
    const missing = error.status === 404;
    const forbidden = error.status === 403 || error.code === API_ERROR_CODES.permissionDenied;
    if (!archived && !missing && !forbidden) return false;

    // A missing customer has no page to stay on; every other failure just ends the current form or dialog.
    if (missing) router.push(ROUTES.customers);
    else close();
    if (archived) {
      toast({
        tone: "error",
        title: "This customer was archived",
        description: "Archived customers can't be changed.",
      });
    } else {
      const { title, detail } = describeMutationError(error);
      toast({ tone: "error", title, description: detail });
    }
    return true;
  };
};
