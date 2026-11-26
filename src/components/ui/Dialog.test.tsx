import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

// Opens like the app's dialogs do: from a plain button, not from a Dialog.Trigger.
const Harness = ({ removeOpener = false }: { removeOpener?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [opener, setOpener] = useState(true);
  return (
    <>
      {opener && (
        <button
          onClick={() => {
            setOpen(true);
            if (removeOpener) setOpener(false);
          }}
        >
          Open
        </button>
      )}
      <button>Elsewhere</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

describe("DialogContent", () => {
  // Regression: Radix returns focus only to a Dialog.Trigger, so focus fell to the page body.
  it("returns focus to the button that opened it when it is dismissed", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog", { name: "Title" });
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("button", { name: "Open" })).toHaveFocus());
  });

  it("does not fail when the opener is gone by the time it closes", async () => {
    render(<Harness removeOpener />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog", { name: "Title" });
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Open" })).not.toBeInTheDocument();
  });
});
