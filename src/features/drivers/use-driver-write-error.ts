import { useRecordWriteError } from "@/components/shared/use-record-write-error";
import { API_ERROR_CODES } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";

const ARCHIVED_RECORDS = { [API_ERROR_CODES.driverArchived]: { singular: "driver", plural: "drivers" } };

/** Failures that end a driver write: archived meanwhile (409), permission lost (403), driver gone (404). */
export const useDriverWriteError = (close: () => void, missingHref: string = ROUTES.drivers) =>
  useRecordWriteError(close, missingHref, ARCHIVED_RECORDS);
