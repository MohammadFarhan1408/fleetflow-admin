import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIdempotencyKey } from "./idempotency";

describe("useIdempotencyKey", () => {
  it("reuses the key for the same body, so a retry replays the first request", () => {
    const { result } = renderHook(() => useIdempotencyKey());

    const first = result.current.keyFor({ name: "Northwind" });
    expect(result.current.keyFor({ name: "Northwind" })).toBe(first);
  });

  it("issues a new key when the body changes, because the API rejects a reused key with another body", () => {
    const { result } = renderHook(() => useIdempotencyKey());

    const first = result.current.keyFor({ name: "Northwind" });
    expect(result.current.keyFor({ name: "Northwind Traders" })).not.toBe(first);
  });

  it("issues a new key after a success", () => {
    const { result } = renderHook(() => useIdempotencyKey());

    const first = result.current.keyFor({ name: "Northwind" });
    result.current.reset();
    expect(result.current.keyFor({ name: "Northwind" })).not.toBe(first);
  });
});
