import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("SegmentedControl", () => {
  it("shows every choice, reports a click, and marks the chosen one", async () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl label="Kind" options={OPTIONS} value="a" onValueChange={onValueChange} />);

    expect(screen.getByRole("radiogroup", { name: "Kind" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));

    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("says when it is required and invalid, and what describes it", () => {
    render(
      <SegmentedControl
        label="Kind"
        options={OPTIONS}
        value="a"
        onValueChange={vi.fn()}
        required
        invalid
        describedBy="why"
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "Kind" });
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "why");
  });
});
