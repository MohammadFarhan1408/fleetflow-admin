import { useRecordWriteError, type ArchivedRecords } from "@/components/shared/use-record-write-error";
import { API_ERROR_CODES } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";

const ARCHIVED_RECORDS: ArchivedRecords = {
  [API_ERROR_CODES.customerArchived]: { singular: "customer", plural: "customers" },
  [API_ERROR_CODES.addressArchived]: { singular: "address", plural: "addresses" },
};

/**
 * Failures that end a customer or address write (archived meanwhile, 403, 404). A missing record goes to
 * `missingHref`: the customer page for an address, whose own page then says if the customer is gone too.
 */
export const useCustomerWriteError = (close: () => void, missingHref: string = ROUTES.customers) =>
  useRecordWriteError(close, missingHref, ARCHIVED_RECORDS);
