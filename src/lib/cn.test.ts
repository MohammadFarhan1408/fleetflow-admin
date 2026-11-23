import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { cn, TYPE_STYLES } from "./cn";

describe("cn", () => {
  it("keeps a type style next to a text colour", () => {
    expect(cn("text-label text-text")).toBe("text-label text-text");
    expect(cn("text-body text-text-secondary")).toBe("text-body text-text-secondary");
  });

  it("lets a later type style or colour win", () => {
    expect(cn("text-caption text-error", "text-body")).toBe("text-error text-body");
    expect(cn("text-body text-muted", "text-error")).toBe("text-body text-error");
  });

  it("merges token shadows", () => {
    expect(cn("shadow-1", "shadow-2")).toBe("shadow-2");
  });

  it("knows every type style defined in tokens.css", () => {
    const css = readFileSync("src/styles/tokens.css", "utf8");
    const defined = [...css.matchAll(/--text-([a-z0-9-]+):/g)]
      .map((match) => match[1])
      .filter((name): name is string => !!name && !name.includes("--"));
    expect([...new Set(defined)].sort()).toEqual([...TYPE_STYLES].sort());
  });
});
