import { describe, expect, it } from "vitest";

import { documentSchema, type DocumentValues } from "./schemas";

const valid: DocumentValues = {
  type: "registration",
  upload_id: "u-1",
  number: "",
  issued_on: "",
  expires_on: "2027-01-01",
  categories: [],
};
const messages = (values: Partial<DocumentValues>) => {
  const result = documentSchema.safeParse({ ...valid, ...values });
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
};

describe("documentSchema", () => {
  it("accepts a registration with a file and an expiry date", () => {
    expect(messages({})).toEqual([]);
  });

  it("needs the file to be uploaded", () => {
    expect(messages({ upload_id: "" })).toEqual(["upload_id: Add the file"]);
  });

  it("needs an expiry date for the types the API requires one for, and not for the others", () => {
    for (const type of ["license", "medical", "registration", "insurance"]) {
      expect(messages({ type, expires_on: "", categories: ["B"] })).toContain("expires_on: Choose the last valid day");
    }
    for (const type of ["id_card", "inspection", "other"]) {
      expect(messages({ type, expires_on: "" })).toEqual([]);
    }
  });

  it("refuses an expiry date before the issue date, and accepts the same day", () => {
    expect(messages({ issued_on: "2027-01-02" })).toEqual([
      "expires_on: The last valid day can't be before the issue date",
    ]);
    expect(messages({ issued_on: "2027-01-01" })).toEqual([]);
  });

  it("needs a category for a licence only", () => {
    expect(messages({ type: "license", categories: [] })).toEqual(["categories: Choose at least one licence category"]);
    expect(messages({ type: "license", categories: ["B"] })).toEqual([]);
    expect(messages({ type: "insurance", categories: [] })).toEqual([]);
  });

  it("limits the number to 50 characters", () => {
    expect(messages({ number: "x".repeat(50) })).toEqual([]);
    expect(messages({ number: "x".repeat(51) })).toEqual(["number: The number can be 50 characters at most"]);
  });
});
