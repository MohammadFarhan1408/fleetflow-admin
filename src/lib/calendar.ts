// Calendar days are `YYYY-MM-DD` strings, never instants: all arithmetic runs in UTC so a day is the same day in every
// timezone and a clock change cannot move it.
const DAY_MS = 24 * 60 * 60 * 1000;

const parseDay = (day: string) => {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date));
};
const formatDay = (date: Date) => date.toISOString().slice(0, 10);

export const addDays = (day: string, days: number) => formatDay(new Date(parseDay(day).getTime() + days * DAY_MS));

/** The same day number in another month, clamped to that month's last day (31 Jan + 1 month = 28 Feb). */
export const addMonths = (day: string, months: number) => {
  const date = parseDay(day);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return formatDay(target);
};

/** Days since the week started, 0 to 6. `firstDay` is 0 for Sunday through 6 for Saturday. */
export const dayOfWeek = (day: string, firstDay: number) => (parseDay(day).getUTCDay() - firstDay + 7) % 7;

/** The month containing `day` as weeks of seven cells; cells outside the month are `null`. */
export const monthWeeks = (day: string, firstDay: number): (string | null)[][] => {
  const first = `${day.slice(0, 7)}-01`;
  const length = new Date(Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)), 0)).getUTCDate();
  const offset = dayOfWeek(first, firstDay);
  const cells = Array.from({ length: Math.ceil((offset + length) / 7) * 7 }, (_, index) =>
    index >= offset && index < offset + length ? addDays(first, index - offset) : null,
  );
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
};

/** The first day of the week for the user's locale as 0 (Sunday) to 6; Monday when the browser cannot say. */
export const localeFirstDay = () => {
  const locale = new Intl.Locale(new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
  };
  return (locale.getWeekInfo?.().firstDay ?? 1) % 7; // the API numbers Monday 1 to Sunday 7
};

/** Today in the browser's timezone. Only a starting point for the calendar: the company's "today" comes from the API. */
export const browserToday = () => {
  const now = new Date();
  return formatDay(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
};
