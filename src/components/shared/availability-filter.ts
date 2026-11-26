import { readOneOf } from "@/lib/url-params";

/** The "Availability" list filter shared by vehicles and drivers. */
export const AVAILABILITY_PARAM = "availability";
export const AVAILABILITY_VALUES = { available: "available", unavailable: "unavailable" } as const;
export const AVAILABILITY_OPTIONS = [
  { value: AVAILABILITY_VALUES.available, label: "Available" },
  { value: AVAILABILITY_VALUES.unavailable, label: "Unavailable" },
];

/** `true` = only available, `false` = only unavailable, `null` = both (also for a value the API would not know). */
export const readAvailabilityFilter = (searchParams: URLSearchParams) => {
  const value = readOneOf(Object.values(AVAILABILITY_VALUES), searchParams.get(AVAILABILITY_PARAM));
  return value === null ? null : value === AVAILABILITY_VALUES.available;
};

/** The day availability is shown for (`?date=2026-11-27`); absent means today. */
export const DATE_PARAM = "date";

/** A real calendar day as `YYYY-MM-DD`, else `null` (an edited link counts as no date). */
export const readDate = (searchParams: URLSearchParams) => {
  const value = searchParams.get(DATE_PARAM);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const day = new Date(`${value}T00:00:00Z`);
  // "2026-02-30" rolls over to March, "2026-13-01" is invalid: only a day that survives the round trip is real.
  return !Number.isNaN(day.getTime()) && day.toISOString().startsWith(value) ? value : null;
};
