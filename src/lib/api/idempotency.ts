import { useRef } from "react";

/**
 * One `Idempotency-Key` per user action (architecture §8). The key is reused while the request body is
 * unchanged, so a retry after a network failure replays the first answer instead of creating a duplicate.
 * A changed body gets a new key, because the API rejects the same key with a different body (422).
 */
export const useIdempotencyKey = () => {
  const current = useRef<{ fingerprint: string; key: string } | null>(null);

  const keyFor = (body: unknown) => {
    const fingerprint = JSON.stringify(body ?? null);
    if (current.current?.fingerprint !== fingerprint) current.current = { fingerprint, key: crypto.randomUUID() };
    return current.current.key;
  };

  /** Call after a success: the next action is a new one. */
  const reset = () => {
    current.current = null;
  };

  return { keyFor, reset };
};
