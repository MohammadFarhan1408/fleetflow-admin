import { daysBetween } from "@/lib/calendar";
import type { FleetDocument } from "./api";

/** design.md §6 Document expiry. A UI threshold: the API gives only the date and `is_expired`. */
export const EXPIRING_SOON_DAYS = 30;

export type DocumentExpiry = { tone: "success" | "warning" | "error" | "neutral"; label: string };

/**
 * Where a document stands, in words short enough for a badge (the date has its own column). `is_expired` is the API's answer (valid through `expires_on` in the company timezone) and
 * decides Expired; `today` only measures "expires soon" and is the browser's date, so it can be a day off near midnight.
 */
export const documentExpiry = (
  { expires_on, is_expired }: Pick<FleetDocument, "expires_on" | "is_expired">,
  today: string,
): DocumentExpiry => {
  if (!expires_on) return { tone: "neutral", label: "No expiry date" };
  if (is_expired) return { tone: "error", label: "Expired" };
  const days = Math.max(0, daysBetween(today, expires_on));
  if (days === 0) return { tone: "warning", label: "Expires today" };
  if (days <= EXPIRING_SOON_DAYS) {
    return { tone: "warning", label: `Expires in ${days} ${days === 1 ? "day" : "days"}` };
  }
  return { tone: "success", label: "Valid" };
};
