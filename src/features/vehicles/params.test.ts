import { describe, expect, it } from "vitest";

import { readVehicleFilters } from "./params";

const read = (query: string) => readVehicleFilters(new URLSearchParams(query));

describe("readVehicleFilters", () => {
  it("has no filters by default", () => {
    expect(read("")).toEqual({
      cursor: null,
      pageSize: 25,
      search: "",
      status: null,
      licenseCategory: null,
      available: null,
      includeArchived: false,
    });
  });

  it("reads every filter from the URL", () => {
    expect(
      read("search=B+AB&status=in_maintenance&license=C1E&availability=unavailable&archived=true&cursor=c2"),
    ).toMatchObject({
      cursor: "c2",
      search: "B AB",
      status: "in_maintenance",
      licenseCategory: "C1E",
      available: false,
      includeArchived: true,
    });
    expect(read("availability=available").available).toBe(true);
  });

  it("treats a value the API does not know (an edited link) as no filter, so no request is rejected", () => {
    expect(read("status=flying&license=Z&availability=maybe")).toMatchObject({
      status: null,
      licenseCategory: null,
      available: null,
    });
  });
});
