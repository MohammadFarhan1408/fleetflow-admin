import { describe, expect, it } from "vitest";

import { readDriverFilters } from "./params";

const read = (query: string) => readDriverFilters(new URLSearchParams(query));

describe("readDriverFilters", () => {
  it("has no filters by default", () => {
    expect(read("")).toEqual({
      cursor: null,
      pageSize: 25,
      search: "",
      status: null,
      available: null,
      date: null,
      includeArchived: false,
    });
  });

  it("reads every filter from the URL", () => {
    expect(
      read("search=dana&status=suspended&availability=available&date=2026-12-01&archived=true&cursor=c2"),
    ).toMatchObject({
      cursor: "c2",
      search: "dana",
      status: "suspended",
      available: true,
      date: "2026-12-01",
      includeArchived: true,
    });
  });

  it("treats values the API would not know as no filter", () => {
    expect(read("status=retired&availability=maybe&date=tomorrow")).toMatchObject({
      status: null,
      available: null,
      date: null,
    });
  });
});
