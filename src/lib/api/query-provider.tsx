"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { LOGIN_NOTICES, loginPath } from "@/lib/routes";
import { ApiError } from "./errors";

/** 4xx answers will not change on retry; network and 5xx failures get two more tries (architecture §11). */
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 && !(error instanceof ApiError && error.status < 500);

const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        // The BFF already tried to refresh: a 401 here means the session is over.
        if (error instanceof ApiError && error.status === 401) {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.assign(loginPath({ next, notice: LOGIN_NOTICES.sessionExpired }));
        }
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry, refetchOnWindowFocus: true },
    },
  });

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
