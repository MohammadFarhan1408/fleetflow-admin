import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "./errors";

/**
 * Puts the API's field errors (`400 validation.invalid`) on the matching form fields and focuses the first.
 * Messages for fields the form does not have come back in `unmapped`, for a form-level alert.
 */
export const applyFieldErrors = <Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  fields: readonly Path<Values>[],
): { mapped: boolean; unmapped: string[] } => {
  if (!(error instanceof ApiError)) return { mapped: false, unmapped: [] };
  let mapped = false;
  const unmapped: string[] = [];
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const known = fields.find((name) => name === field);
    if (known && messages[0]) {
      setError(known, { message: messages[0] }, { shouldFocus: !mapped });
      mapped = true;
    } else {
      unmapped.push(...messages);
    }
  }
  return { mapped, unmapped };
};
