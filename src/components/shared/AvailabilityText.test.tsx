import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvailabilityText, describeReasons } from "./AvailabilityText";

const LABELS = { archived: "Archived", on_leave: "On leave" };

describe("describeReasons", () => {
  it("uses the display labels", () => {
    expect(describeReasons(["on_leave", "archived"], LABELS)).toBe("On leave, Archived");
  });

  it("shows a reason added by a later API version instead of dropping it", () => {
    expect(describeReasons(["inspection_overdue"], LABELS)).toBe("Inspection overdue");
  });
});

describe("AvailabilityText", () => {
  it("says Available", () => {
    render(<AvailabilityText availability={{ available: true, reasons: [] }} labels={LABELS} />);
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("says Unavailable with the reasons", () => {
    render(<AvailabilityText availability={{ available: false, reasons: ["on_leave"] }} labels={LABELS} />);
    expect(screen.getByText("Unavailable: On leave")).toBeInTheDocument();
  });
});
