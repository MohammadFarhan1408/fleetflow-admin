import { humanizeCode } from "@/lib/format";
import type { Vehicle } from "./api";
import { UNAVAILABLE_REASON_LABELS } from "./labels";

export type Availability = { available: boolean; reasons: string[] };

/**
 * The API documents `availability` as `{available, reasons[]}` but its schema types it as a free object, so it is
 * checked here. Returns null when the shape is not the documented one, rather than guessing.
 */
export const readAvailability = (raw: Vehicle["availability"]): Availability | null => {
  if (typeof raw.available !== "boolean") return null;
  const reasons = Array.isArray(raw.reasons) ? raw.reasons.filter((reason) => typeof reason === "string") : [];
  return { available: raw.available, reasons };
};

/** "In maintenance, Archived". Later API versions add reasons, so an unknown one is shown humanized, not dropped. */
export const describeReasons = (reasons: string[]) =>
  reasons
    .map((reason) =>
      reason in UNAVAILABLE_REASON_LABELS
        ? UNAVAILABLE_REASON_LABELS[reason as keyof typeof UNAVAILABLE_REASON_LABELS]
        : humanizeCode(reason),
    )
    .join(", ");
