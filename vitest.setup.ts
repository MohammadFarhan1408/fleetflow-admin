import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, vi } from "vitest";

import { server } from "@/test/msw";

// `server-only` throws outside a React Server environment; server modules are tested directly here.
vi.mock("server-only", () => ({}));

server.listen({ onUnhandledFrame: "error" });

// jsdom has no fetch of its own, and Node's fetch rejects relative URLs. Resolve them against the page
// URL, as a browser would. This wraps MSW's interceptor, so requests are still mocked.
if (typeof window !== "undefined") {
  const interceptedFetch = globalThis.fetch;
  globalThis.fetch = (input, init) =>
    interceptedFetch(
      typeof input === "string" && input.startsWith("/") ? new URL(input, window.location.href) : input,
      init,
    );
}

// jsdom lacks the pointer-capture and scroll APIs Radix Select calls when it opens.
if (typeof window !== "undefined") {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
  // Radix measures some controls (radio group) with ResizeObserver, which jsdom lacks; layout is not tested here.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
