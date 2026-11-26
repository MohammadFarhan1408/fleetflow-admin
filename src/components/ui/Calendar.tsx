"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import { addDays, addMonths, browserToday, dayOfWeek, localeFirstDay, monthWeeks } from "@/lib/calendar";

const monthTitle = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeZone: "UTC" });
const weekdayShort = new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" });
const weekdayLong = new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: "UTC" });

type CalendarProps = {
  /** The selected day, `YYYY-MM-DD`, or empty. */
  value: string;
  onSelect: (day: string) => void;
  /** First day of the week, 0 (Sunday) to 6; defaults to the browser locale's. */
  firstDay?: number;
};

// Keys that move the focused day, as a step in days or months (design.md §6 Date picker).
const MOVES: Record<string, (day: string, firstDay: number, shift: boolean) => string> = {
  ArrowLeft: (day) => addDays(day, -1),
  ArrowRight: (day) => addDays(day, 1),
  ArrowUp: (day) => addDays(day, -7),
  ArrowDown: (day) => addDays(day, 7),
  Home: (day, firstDay) => addDays(day, -dayOfWeek(day, firstDay)),
  End: (day, firstDay) => addDays(day, 6 - dayOfWeek(day, firstDay)),
  PageUp: (day, _firstDay, shift) => addMonths(day, shift ? -12 : -1),
  PageDown: (day, _firstDay, shift) => addMonths(day, shift ? 12 : 1),
};

/** design.md §6 Date picker: a month grid with one tab stop. The month shown follows the focused day. */
export const Calendar = ({ value, onSelect, firstDay = localeFirstDay() }: CalendarProps) => {
  const [focused, setFocused] = useState(value || browserToday());
  const grid = useRef<HTMLTableElement>(null);
  const moveFocus = useRef(false);
  const weeks = monthWeeks(focused, firstDay);
  const header = (weeks[0] ?? []).map((_, column) =>
    addDays(`${focused.slice(0, 7)}-01`, column - dayOfWeek(`${focused.slice(0, 7)}-01`, firstDay)),
  );

  // Focus follows the keyboard, but never steals it when the calendar first opens.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [focused]);

  const focusDay = (day: string) => {
    moveFocus.current = true;
    setFocused(day);
  };

  return (
    <div className="flex w-64 flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setFocused(addMonths(focused, -1))}
          className="grid size-8 place-items-center rounded-md text-text-secondary hover:bg-hover hover:text-text"
        >
          <ChevronLeftIcon aria-hidden className="size-4" />
        </button>
        <div aria-live="polite" className="text-label text-text">
          {monthTitle.format(new Date(`${focused}T00:00:00Z`))}
        </div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setFocused(addMonths(focused, 1))}
          className="grid size-8 place-items-center rounded-md text-text-secondary hover:bg-hover hover:text-text"
        >
          <ChevronRightIcon aria-hidden className="size-4" />
        </button>
      </div>
      <table
        ref={grid}
        role="grid"
        aria-label={monthTitle.format(new Date(`${focused}T00:00:00Z`))}
        className="w-full table-fixed border-collapse"
        onKeyDown={(event) => {
          const move = MOVES[event.key];
          if (!move) return;
          event.preventDefault();
          focusDay(move(focused, firstDay, event.shiftKey));
        }}
      >
        <thead>
          <tr>
            {header.map((day) => (
              <th
                key={day}
                scope="col"
                abbr={weekdayLong.format(new Date(`${day}T00:00:00Z`))}
                className="h-8 text-caption font-normal text-muted"
              >
                {weekdayShort.format(new Date(`${day}T00:00:00Z`))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, column) => (
                <td
                  key={day ?? `blank-${column}`}
                  role="gridcell"
                  aria-selected={day ? day === value : undefined}
                  className="p-0 text-center"
                >
                  {day && (
                    <button
                      type="button"
                      tabIndex={day === focused ? 0 : -1}
                      aria-label={fullDate.format(new Date(`${day}T00:00:00Z`))}
                      onFocus={() => setFocused(day)}
                      onClick={() => onSelect(day)}
                      className={cn(
                        "size-8 rounded-md text-body tabular-nums transition-colors",
                        day === value
                          ? "bg-primary text-primary-fg hover:bg-primary-hover"
                          : "text-text hover:bg-hover",
                      )}
                    >
                      {Number(day.slice(8))}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
