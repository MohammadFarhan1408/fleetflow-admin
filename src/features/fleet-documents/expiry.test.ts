import { describe, expect, it } from "vitest";

import { documentExpiry, EXPIRING_SOON_DAYS } from "./expiry";

const TODAY = "2026-11-27";
const doc = (expires_on: string | null, is_expired = false) => ({ expires_on, is_expired });

describe("documentExpiry", () => {
  it("says a document without an expiry date has none", () => {
    expect(documentExpiry(doc(null), TODAY)).toEqual({ tone: "neutral", label: "No expiry date" });
  });

  it("is valid beyond the threshold, and expires soon on the threshold day itself", () => {
    expect(EXPIRING_SOON_DAYS).toBe(30);
    expect(documentExpiry(doc("2026-12-28"), TODAY)).toEqual({ tone: "success", label: "Valid" }); // +31
    expect(documentExpiry(doc("2026-12-27"), TODAY)).toEqual({ tone: "warning", label: "Expires in 30 days" });
  });

  it("counts down to the last valid day, which is still valid", () => {
    expect(documentExpiry(doc("2026-11-28"), TODAY).label).toBe("Expires in 1 day");
    expect(documentExpiry(doc("2026-11-27"), TODAY)).toEqual({ tone: "warning", label: "Expires today" });
  });

  it("takes Expired from the API, not from the browser's date", () => {
    expect(documentExpiry(doc("2026-11-26", true), TODAY)).toEqual({ tone: "error", label: "Expired" });
    // The browser thinks the day has passed, the API (company timezone) says it has not: the API wins.
    expect(documentExpiry(doc("2026-11-26", false), TODAY)).toEqual({ tone: "warning", label: "Expires today" });
  });
});
