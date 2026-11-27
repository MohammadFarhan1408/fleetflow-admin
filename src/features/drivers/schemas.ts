import { z } from "zod";

import { REASON_MAX_LENGTH } from "@/components/shared/status-change";
import { requiredPhoneSchema } from "@/lib/phone";
import { leaveDays } from "./leave";

// Client-side checks for UX only; fleetflow-api validates again (it owns the rules). Limits are from the contract.
export const MAX_LEAVE_DAYS = 366;

/** A driver profile. The user is chosen on create only; an existing profile keeps its user. */
export const driverSchema = (requireUser: boolean) =>
  z
    .object({
      user_id: z.string(),
      branch_id: z.string().min(1, "Choose a branch"),
      phone: requiredPhoneSchema,
    })
    .superRefine(({ user_id }, context) => {
      if (requireUser && user_id === "") {
        context.addIssue({ code: "custom", path: ["user_id"], message: "Choose the user who will drive" });
      }
    });
export type DriverValues = z.infer<ReturnType<typeof driverSchema>>;

export const leaveSchema = z
  .object({
    starts_on: z.string().min(1, "Choose the first day"),
    ends_on: z.string().min(1, "Choose the last day"),
    reason: z
      .string()
      .trim()
      .min(1, "Say why the driver is away")
      .max(REASON_MAX_LENGTH, `Reason must be ${REASON_MAX_LENGTH} characters or fewer`),
  })
  .superRefine(({ starts_on, ends_on }, context) => {
    if (!starts_on || !ends_on) return;
    if (ends_on < starts_on) {
      context.addIssue({ code: "custom", path: ["ends_on"], message: "The last day can't be before the first" });
    } else if (leaveDays(starts_on, ends_on) > MAX_LEAVE_DAYS) {
      context.addIssue({
        code: "custom",
        path: ["ends_on"],
        message: `Leave can last at most ${MAX_LEAVE_DAYS} days`,
      });
    }
  });
export type LeaveValues = z.infer<typeof leaveSchema>;
