import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";

const renderPicker = (value: string, onChange = vi.fn()) =>
  render(
    <DatePicker label="Availability on" value={value} onChange={onChange} placeholder="Today" resetLabel="Today" />,
  );

describe("DatePicker", () => {
  it("shows the placeholder while nothing is chosen, and the day once it is", () => {
    const { unmount } = renderPicker("");
    expect(screen.getByRole("button", { name: "Availability on: Today" })).toBeInTheDocument();
    unmount();
    renderPicker("2026-11-26");
    expect(screen.getByRole("button", { name: /^Availability on: .*2026/ })).toBeInTheDocument();
  });

  it("reports the chosen day and closes", async () => {
    const onChange = vi.fn();
    renderPicker("2026-11-26", onChange);

    await userEvent.click(screen.getByRole("button", { name: /^Availability on:/ }));
    await userEvent.click(await screen.findByRole("button", { name: /3 November 2026|November 3, 2026/ }));

    expect(onChange).toHaveBeenCalledWith("2026-11-03");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("clears with the reset button, which is off while nothing is chosen", async () => {
    const onChange = vi.fn();
    const { unmount } = renderPicker("", onChange);
    await userEvent.click(screen.getByRole("button", { name: "Availability on: Today" }));
    expect(await screen.findByRole("button", { name: "Today" })).toBeDisabled();
    unmount();

    renderPicker("2026-11-26", onChange);
    await userEvent.click(screen.getByRole("button", { name: /^Availability on:/ }));
    await userEvent.click(await screen.findByRole("button", { name: "Today" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("closes with Escape and returns focus to the button", async () => {
    renderPicker("2026-11-26");
    const trigger = screen.getByRole("button", { name: /^Availability on:/ });

    await userEvent.click(trigger);
    await screen.findByRole("grid");
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
