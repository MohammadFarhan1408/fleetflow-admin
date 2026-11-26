import { useRecordWriteError } from "@/components/shared/use-record-write-error";
import { API_ERROR_CODES } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";

const ARCHIVED_RECORDS = { [API_ERROR_CODES.vehicleArchived]: { singular: "vehicle", plural: "vehicles" } };

/** Failures that end a vehicle write: archived meanwhile (409), permission lost (403), vehicle gone (404). */
export const useVehicleWriteError = (close: () => void, missingHref: string = ROUTES.vehicles) =>
  useRecordWriteError(close, missingHref, ARCHIVED_RECORDS);
