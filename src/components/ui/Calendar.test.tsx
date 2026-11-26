import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "./Calendar";

const day = (name: RegExp) => screen.getByRole("button", { name });

describe("Calendar", () => {
  it("shows the month of the value, marks the selected day and names days in full", () => {
    render(<Calendar value="2026-11-26" onSelect={vi.fn()} firstDay={1} />);

    expect(screen.getByRole("grid", { name: /November 2026/ })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")[0]).toHaveTextContent(/Mon/);
    expect(day(/26 November 2026|November 26, 2026/).closest("td")).toHaveAttribute("aria-selected", "true");
    expect(day(/25 November 2026|November 25, 2026/).closest("td")).toHaveAttribute("aria-selected", "false");
  });

  it("selects the day that was clicked", async () => {
    const onSelect = vi.fn();
    render(<Calendar value="2026-11-26" onSelect={onSelect} firstDay={1} />);

    await userEvent.click(day(/3 November 2026|November 3, 2026/));

    expect(onSelect).toHaveBeenCalledWith("2026-11-03");
  });

  it("moves between months without selecting, clamping the day", async () => {
    const onSelect = vi.fn();
    render(<Calendar value="2026-01-31" onSelect={onSelect} firstDay={1} />);

    await userEvent.click(screen.getByRole("button", { name: "Next month" }));

    expect(screen.getByRole("grid", { name: /February 2026/ })).toBeInTheDocument();
    expect(day(/28 February 2026|February 28, 2026/)).toHaveAttribute("tabindex", "0");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("has one tab stop and moves the focused day with the arrow, Home, End and Page keys", async () => {
    render(<Calendar value="2026-11-26" onSelect={vi.fn()} firstDay={1} />);
    const focused = () => document.activeElement as HTMLElement;

    await userEvent.tab(); // Previous month
    await userEvent.tab(); // Next month
    await userEvent.tab(); // the focused day: Thursday 26 Nov
    expect(focused()).toHaveAccessibleName(/26 November 2026|November 26, 2026/);
    await userEvent.keyboard("{ArrowRight}");
    expect(focused()).toHaveAccessibleName(/27 November 2026|November 27, 2026/);
    await userEvent.keyboard("{ArrowDown}");
    expect(focused()).toHaveAccessibleName(/4 December 2026|December 4, 2026/);
    expect(screen.getByRole("grid", { name: /December 2026/ })).toBeInTheDocument();
    await userEvent.keyboard("{Home}");
    expect(focused()).toHaveAccessibleName(/30 November 2026|November 30, 2026/); // Monday of that week
    await userEvent.keyboard("{PageDown}");
    expect(focused()).toHaveAccessibleName(/30 December 2026|December 30, 2026/);
  });

  it("selects the focused day with Enter", async () => {
    const onSelect = vi.fn();
    render(<Calendar value="2026-11-26" onSelect={onSelect} firstDay={1} />);

    await userEvent.click(day(/20 November 2026|November 20, 2026/));
    onSelect.mockClear();
    await userEvent.keyboard("{ArrowLeft}{Enter}");

    expect(onSelect).toHaveBeenCalledWith("2026-11-19");
  });
});
