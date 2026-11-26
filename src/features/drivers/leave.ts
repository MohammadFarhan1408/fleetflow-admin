const DAY_MS = 24 * 60 * 60 * 1000;

/** Days in a leave period; both the first and the last day count (API: `ends_on` is included). */
export const leaveDays = (startsOn: string, endsOn: string) =>
  Math.round((Date.parse(`${endsOn}T00:00:00Z`) - Date.parse(`${startsOn}T00:00:00Z`)) / DAY_MS) + 1;
