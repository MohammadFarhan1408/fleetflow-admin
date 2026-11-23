"use client";

import { useSyncExternalStore } from "react";

/**
 * A per-browser UI preference in localStorage (architecture §12: preferences only, never server data).
 * Every component using the same preference re-renders when it changes, including in other tabs.
 */
export const createPreference = <Value extends string>(
  key: string,
  fallback: Value,
  isValid: (value: string) => value is Value,
) => {
  const listeners = new Set<() => void>();

  const read = (): Value => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null && isValid(stored) ? stored : fallback;
    } catch {
      return fallback; // Storage blocked (private mode): use the default.
    }
  };

  const subscribe = (onChange: () => void) => {
    listeners.add(onChange);
    window.addEventListener("storage", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  };

  const write = (next: Value) => {
    try {
      if (next === fallback) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch (error) {
      console.warn(`Preference "${key}" not saved`, error);
    }
    listeners.forEach((listener) => listener());
  };

  const usePreference = () => [useSyncExternalStore(subscribe, read, () => fallback), write] as const;

  return { usePreference };
};
