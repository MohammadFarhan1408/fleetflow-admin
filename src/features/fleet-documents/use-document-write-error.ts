import { useRecordWriteError } from "@/components/shared/use-record-write-error";
import { API_ERROR_CODES } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";
import type { DocumentOwner } from "./api";

const ARCHIVED_RECORDS = {
  [API_ERROR_CODES.driverArchived]: { singular: "driver", plural: "drivers" },
  [API_ERROR_CODES.vehicleArchived]: { singular: "vehicle", plural: "vehicles" },
};

/** Failures that end a document write: the owner was archived meanwhile (409), permission lost (403), owner gone (404). */
export const useDocumentWriteError = (owner: DocumentOwner, close: () => void) =>
  useRecordWriteError(close, owner === "drivers" ? ROUTES.drivers : ROUTES.vehicles, ARCHIVED_RECORDS);
