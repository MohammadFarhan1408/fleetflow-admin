import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import { ToastProvider } from "@/components/shared/ToastProvider";
import { SessionProvider } from "@/features/session/SessionContext";
import { buildSession } from "./session";

const newQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

/** Renders with a fresh query client that never retries, so error states appear immediately. */
export const renderWithQuery = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={newQueryClient()}>{ui}</QueryClientProvider>);

/** Renders inside what the console layout provides: session (`permissions` and any `/me` field), toasts and queries. */
export const renderInConsole = (
  ui: React.ReactElement,
  session: { permissions: string[] } & Partial<Parameters<typeof buildSession>[0]>,
) => {
  const client = newQueryClient();
  const view = render(
    <SessionProvider session={buildSession(session)}>
      <QueryClientProvider client={client}>
        <ToastProvider>{ui}</ToastProvider>
      </QueryClientProvider>
    </SessionProvider>,
  );
  return { ...view, client };
};
