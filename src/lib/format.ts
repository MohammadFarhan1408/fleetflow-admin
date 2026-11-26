/** "ops_manager" → "Ops manager". For API codes that have no display label of their own (roles). */
export const humanizeCode = (code: string) => {
  const words = code.replaceAll("_", " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Up to two initials from a name, falling back to the first letter of the email. */
export const initialsOf = (fullName: string, email: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}` : (parts[0]?.[0] ?? email[0] ?? "?");
  return letters.toUpperCase();
};

// ponytail: the browser's timezone. design.md §11 wants the company timezone, which `/me` does not expose yet
// (API request in memory.md); switch the `timeZone` option here once it does.
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
});
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
// A date without a time ("2026-11-26", from `availability.date` or leave) names a calendar day, not an instant: read
// as UTC midnight and shown in UTC, it prints the same day in every timezone.
const calendarDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" });
const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** "24 Nov 2026, 14:35 CET" */
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));

/** "24 Nov 2026" */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

/** "26 Nov 2026" for a date-only value ("2026-11-26"). */
export const formatCalendarDate = (isoDate: string) => calendarDateFormat.format(new Date(`${isoDate}T00:00:00Z`));

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 hours ago", "yesterday", "just now". */
export const formatRelative = (iso: string, now = Date.now()) => {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return "just now";
};
