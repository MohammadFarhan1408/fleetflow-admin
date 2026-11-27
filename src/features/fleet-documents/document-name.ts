import { formatCalendarDate } from "@/lib/format";
import type { FleetDocument } from "./api";
import { DOCUMENT_TYPE_LABELS } from "./labels";

/** How a document is named in a button or a confirmation: its type, plus its number or its expiry day to tell two apart. */
export const documentName = (document: FleetDocument) => {
  const type = DOCUMENT_TYPE_LABELS[document.type];
  if (document.number) return `${type} ${document.number}`;
  return document.expires_on ? `${type} expiring ${formatCalendarDate(document.expires_on)}` : type;
};
