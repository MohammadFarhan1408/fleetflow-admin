import { z } from "zod";

import { NUMBER_MAX_LENGTH, TYPES_WITH_EXPIRY } from "./labels";

// Client-side checks for UX only; fleetflow-api validates again (it owns the rules). Limits are from the contract.
export const documentSchema = z
  .object({
    type: z.string().min(1, "Choose the document type"),
    upload_id: z.string().min(1, "Add the file"),
    number: z.string().trim().max(NUMBER_MAX_LENGTH, `The number can be ${NUMBER_MAX_LENGTH} characters at most`),
    issued_on: z.string(),
    expires_on: z.string(),
    categories: z.array(z.string()),
  })
  .superRefine(({ type, issued_on, expires_on, categories }, context) => {
    if (TYPES_WITH_EXPIRY.some((required) => required === type) && !expires_on) {
      context.addIssue({ code: "custom", path: ["expires_on"], message: "Choose the last valid day" });
    }
    if (issued_on && expires_on && expires_on < issued_on) {
      context.addIssue({
        code: "custom",
        path: ["expires_on"],
        message: "The last valid day can't be before the issue date",
      });
    }
    if (type === "license" && categories.length === 0) {
      context.addIssue({ code: "custom", path: ["categories"], message: "Choose at least one licence category" });
    }
  });
export type DocumentValues = z.infer<typeof documentSchema>;
