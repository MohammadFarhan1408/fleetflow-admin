import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormFooter } from "./FormFooter";

describe("FormFooter", () => {
  // Regression: pressing a button blurred the focused field, its error line appeared, the button moved
  // and the click landed beside it, so the first click on "Add" did nothing.
  it("keeps focus in the field when a button is pressed, so blur validation cannot move the button mid-click", () => {
    render(<FormFooter dirty={false} submitting={false} submitLabel="Save" onCancel={() => {}} />);

    for (const name of ["Save", "Cancel"]) {
      // fireEvent returns false when the event's default action (moving focus) was prevented.
      expect(fireEvent.mouseDown(screen.getByRole("button", { name }))).toBe(false);
    }
  });

  it("shows the unsaved-changes signal only when dirty", () => {
    const { rerender } = render(<FormFooter dirty={false} submitting={false} submitLabel="Save" onCancel={() => {}} />);
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();

    rerender(<FormFooter dirty submitting={false} submitLabel="Save" onCancel={() => {}} />);
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  });
});
