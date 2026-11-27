import { describe, expect, it } from "vitest";

import { readBranch } from "./params";

const ID = "01a21e3d-8fc5-74dd-b20c-e5a72761d912";

describe("readBranch", () => {
  it("returns a branch id", () => {
    expect(readBranch(new URLSearchParams(`branch=${ID}`))).toBe(ID);
  });

  it.each(["", "not-a-uuid", "b-1", `${ID}x`, ID.replaceAll("-", "")])("ignores %j", (value) => {
    expect(readBranch(new URLSearchParams({ branch: value }))).toBeNull();
  });

  it("is null when absent", () => {
    expect(readBranch(new URLSearchParams())).toBeNull();
  });
});
