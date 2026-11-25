import { describe, expect, it, vi } from "vitest";

import { ApiError } from "./errors";
import { applyFieldErrors } from "./form-errors";

type Values = { name: string; email: string };
const FIELDS = ["name", "email"] as const;
const validation = (errors: Record<string, string[]>) =>
  new ApiError(400, { code: "validation.invalid", detail: "x", request_id: "r", errors }, null);

describe("applyFieldErrors", () => {
  it("puts each message on its field and focuses only the first", () => {
    const setError = vi.fn();

    const result = applyFieldErrors<Values>(
      validation({ name: ["Too long."], email: ["Enter a valid email address."] }),
      setError,
      FIELDS,
    );

    expect(result).toEqual({ mapped: true, unmapped: [] });
    expect(setError).toHaveBeenNthCalledWith(1, "name", { message: "Too long." }, { shouldFocus: true });
    expect(setError).toHaveBeenNthCalledWith(
      2,
      "email",
      { message: "Enter a valid email address." },
      { shouldFocus: false },
    );
  });

  it("returns messages for fields the form does not have", () => {
    const setError = vi.fn();

    const result = applyFieldErrors<Values>(validation({ non_field_errors: ["Not allowed."] }), setError, FIELDS);

    expect(result).toEqual({ mapped: false, unmapped: ["Not allowed."] });
    expect(setError).not.toHaveBeenCalled();
  });

  it("ignores errors that are not API errors", () => {
    const setError = vi.fn();

    expect(applyFieldErrors<Values>(new Error("boom"), setError, FIELDS)).toEqual({ mapped: false, unmapped: [] });
    expect(setError).not.toHaveBeenCalled();
  });
});
