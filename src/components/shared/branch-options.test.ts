import { describe, expect, it } from "vitest";

import { branchOptions } from "./branch-options";

const MINE = [
  { public_id: "b-1", name: "Berlin depot" },
  { public_id: "b-2", name: "Hamburg hub" },
];

describe("branchOptions", () => {
  it("offers the user's own branches", () => {
    expect(branchOptions(MINE)).toEqual([
      { value: "b-1", label: "Berlin depot" },
      { value: "b-2", label: "Hamburg hub" },
    ]);
  });

  it("keeps a vehicle's current branch when it is not one of the user's, so editing never loses it", () => {
    expect(branchOptions(MINE, { public_id: "b-9", name: "Munich yard" }).at(-1)).toEqual({
      value: "b-9",
      label: "Munich yard",
    });
  });

  it("does not list the current branch twice", () => {
    expect(branchOptions(MINE, { public_id: "b-1", name: "Berlin depot" })).toHaveLength(2);
  });

  it("is empty for a user with no branches and no vehicle", () => {
    expect(branchOptions([])).toEqual([]);
  });
});
