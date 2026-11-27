import { z } from "zod";

export const REASON_MAX_LENGTH = 255;

/**
 * A status change with the reason the API requires for every status except the one that needs none (`active`). Client
 * checks are UX only; fleetflow-api validates again.
 */
export const statusChangeSchema = (
  statuses: readonly [string, ...string[]],
  reasonFreeStatus: string,
  reasonMessage: (status: string) => string,
) =>
  z
    .object({
      status: z.enum(statuses, "Choose a status"),
      reason: z.string().trim().max(REASON_MAX_LENGTH, `Reason must be ${REASON_MAX_LENGTH} characters or fewer`),
    })
    .superRefine(({ status, reason }, context) => {
      if (status === reasonFreeStatus || reason !== "") return;
      context.addIssue({ code: "custom", path: ["reason"], message: reasonMessage(status) });
    });

export type StatusChangeValues = { status: string; reason: string };
