import { describe, expect, it } from "vitest";

import { readDriverFilters } from "./params";

const read = (query: string) => readDriverFilters(new URLSearchParams(query));

describe("readDriverFilters", () => {
  it("has no filters by default", () => {
    expect(read("")).toEqual({
      cursor: null,
      pageSize: 25,
      search: "",
      branch: null,
      status: null,
      available: null,
      date: null,
      includeArchived: false,
    });
  });

  it("reads every filter from the URL", () => {
    expect(
      read(
        "branch=01a21e3d-8fc5-74dd-b20c-e5a72761d912&search=dana&status=suspended&availability=available&date=2026-12-01&archived=true&cursor=c2",
      ),
    ).toMatchObject({
      branch: "01a21e3d-8fc5-74dd-b20c-e5a72761d912",
      cursor: "c2",
      search: "dana",
      status: "suspended",
      available: true,
      date: "2026-12-01",
      includeArchived: true,
    });
  });

  it("treats values the API would not know as no filter", () => {
    expect(read("branch=nope&status=retired&availability=maybe&date=tomorrow")).toMatchObject({
      branch: null,
      status: null,
      available: null,
      date: null,
    });
  });
});
