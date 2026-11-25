import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_TOASTS, SUCCESS_TOAST_MS, ToastProvider, useToast, type ToastInput } from "./ToastProvider";

const Trigger = ({ toast }: { toast: ToastInput }) => {
  const show = useToast();
  return <button onClick={() => show(toast)}>Show {toast.title}</button>;
};

const renderToasts = (...toasts: ToastInput[]) =>
  render(
    <ToastProvider>
      {toasts.map((toast) => (
        <Trigger key={toast.title} toast={toast} />
      ))}
    </ToastProvider>,
  );

describe("ToastProvider", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("shows a success toast and dismisses it after 4 seconds", async () => {
    renderToasts({ tone: "success", title: "Customer Northwind added" });
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole("button"));

    expect(screen.getByText("Customer Northwind added")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(SUCCESS_TOAST_MS + 500));
    expect(screen.queryByText("Customer Northwind added")).not.toBeInTheDocument();
  });

  it("keeps an error toast until it is dismissed", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderToasts({ tone: "error", title: "Can't reach FleetFlow", description: "Check your connection." });
    await user.click(screen.getByRole("button"));

    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(screen.getByText("Can't reach FleetFlow")).toBeInTheDocument();
    expect(screen.getByText("Check your connection.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(screen.queryByText("Can't reach FleetFlow")).not.toBeInTheDocument();
  });

  it(`shows at most ${MAX_TOASTS} toasts, dropping the oldest`, async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const titles = ["One", "Two", "Three", "Four"];
    renderToasts(...titles.map((title) => ({ tone: "error" as const, title })));
    for (const title of titles) await user.click(screen.getByRole("button", { name: `Show ${title}` }));

    expect(screen.queryByText("One")).not.toBeInTheDocument();
    for (const title of titles.slice(1)) expect(screen.getByText(title)).toBeInTheDocument();
  });
});
