import { humanizeCode } from "@/lib/format";
import { UNAVAILABLE_REASON_LABELS } from "./labels";

/**
 * "In maintenance, No insurance on file". The API adds reasons without a version change, so a reason newer than the
 * generated enum is shown humanized instead of being dropped.
 */
export const describeReasons = (reasons: readonly string[]) =>
  reasons
    .map((reason) =>
      reason in UNAVAILABLE_REASON_LABELS
        ? UNAVAILABLE_REASON_LABELS[reason as keyof typeof UNAVAILABLE_REASON_LABELS]
        : humanizeCode(reason),
    )
    .join(", ");
