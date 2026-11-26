import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("is a labelled, typeable multi-line field", async () => {
    render(
      <>
        <label htmlFor="why">Reason</label>
        <Textarea id="why" />
      </>,
    );

    await userEvent.type(screen.getByRole("textbox", { name: "Reason" }), "Brake service{Enter}next day");

    expect(screen.getByRole("textbox", { name: "Reason" })).toHaveValue("Brake service\nnext day");
  });

  it("passes the invalid, disabled and length attributes through", () => {
    render(<Textarea aria-label="Reason" aria-invalid disabled maxLength={255} />);

    const field = screen.getByRole("textbox", { name: "Reason" });
    expect(field).toBeInvalid();
    expect(field).toBeDisabled();
    expect(field).toHaveAttribute("maxlength", "255");
  });

  it("forwards its ref, so a form can focus it", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Reason" ref={ref} />);

    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Reason" }));
  });
});
