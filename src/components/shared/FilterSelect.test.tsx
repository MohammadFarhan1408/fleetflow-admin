import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FilterSelect } from "./FilterSelect";

const navigation = vi.hoisted(() => ({ search: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => "/things",
  useRouter: () => ({ replace: navigation.replace }),
}));

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];
const renderSelect = () =>
  render(<FilterSelect label="Filter by kind" param="kind" options={OPTIONS} anyLabel="All kinds" />);

describe("FilterSelect", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("shows 'no filter' until a value is chosen", () => {
    renderSelect();

    expect(screen.getByRole("combobox", { name: "Filter by kind" })).toHaveTextContent("All kinds");
  });

  it("writes the choice to the URL, keeps other filters and drops the page cursor", async () => {
    navigation.search = "search=x&cursor=c1";
    renderSelect();

    await userEvent.click(screen.getByRole("combobox", { name: "Filter by kind" }));
    await userEvent.click(await screen.findByRole("option", { name: "Beta" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things?search=x&kind=b", { scroll: false });
  });

  it("removes the parameter when 'no filter' is chosen again", async () => {
    navigation.search = "kind=a";
    renderSelect();
    expect(screen.getByRole("combobox", { name: "Filter by kind" })).toHaveTextContent("Alpha");

    await userEvent.click(screen.getByRole("combobox", { name: "Filter by kind" }));
    await userEvent.click(await screen.findByRole("option", { name: "All kinds" }));

    expect(navigation.replace).toHaveBeenCalledWith("/things", { scroll: false });
  });

  it("shows a value that is not an option (an edited link) as 'no filter'", () => {
    navigation.search = "kind=zzz";
    renderSelect();

    expect(screen.getByRole("combobox", { name: "Filter by kind" })).toHaveTextContent("All kinds");
  });
});
